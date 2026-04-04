import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { createSession, applySessionCookie } from '@/lib/auth/session';
import { normalizeEmail, verifySecret } from '@/lib/auth/security';
import { checkLoginRateLimit, clearLoginAttempts, recordFailedLogin } from '@/lib/auth/loginRateLimit';
import { maybeRaiseMultiIpFailedLoginAlert } from '@/lib/security/loginAnomalyAlerts';

type LoginRequest = {
  identifier?: string;
  password?: string;
  role?: 'trainee' | 'admin';
};

type AuthAuditAction = 'login_success' | 'login_failed' | 'login_rate_limited';

async function logAuthAudit(
  action: AuthAuditAction,
  options: {
    identifier?: string;
    roleRequested: 'trainee' | 'admin';
    userId?: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }
) {
  try {
    const db = await getMongoDb();
    await db.collection(COLLECTIONS.authAudit).insertOne({
      action,
      identifier: options.identifier,
      roleRequested: options.roleRequested,
      userId: options.userId,
      source: 'email_password',
      ip: options.ip,
      userAgent: options.userAgent,
      reason: options.reason,
      createdAt: new Date(),
    });
  } catch {
    // Best-effort audit logging should never break authentication flow.
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequest;
    const identifier = body.identifier?.trim();
    const password = body.password?.trim();
    const role = body.role || 'trainee';
    const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    if (!identifier || !password) {
      return NextResponse.json({ ok: false, message: 'Identifier and password are required.' }, { status: 400 });
    }

    if (!identifier.includes('@')) {
      return NextResponse.json({ ok: false, message: 'Email and password login is required.' }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(identifier);
    const rateLimitKey = `${normalizedEmail}:${ip}:${userAgent}`;
    const rateStatus = checkLoginRateLimit(rateLimitKey);
    if (rateStatus.blocked) {
      await logAuthAudit('login_rate_limited', {
        identifier: normalizedEmail,
        roleRequested: role,
        ip,
        userAgent,
        reason: 'too_many_attempts',
      });

      return NextResponse.json(
        {
          ok: false,
          message: `Too many failed login attempts. Try again in ${rateStatus.retryAfterSec || 60} seconds.`,
        },
        { status: 429 }
      );
    }

    const db = await getMongoDb();
    const users = db.collection(COLLECTIONS.users);
    const query = { email: normalizedEmail };

    const user = await users.findOne(query);
    if (!user) {
      recordFailedLogin(rateLimitKey);
      await logAuthAudit('login_failed', {
        identifier: normalizedEmail,
        roleRequested: role,
        ip,
        userAgent,
        reason: 'user_not_found',
      });
      await maybeRaiseMultiIpFailedLoginAlert(db, normalizedEmail);
      return NextResponse.json(
        { ok: false, message: 'Incorrect email or password. Please try again.' },
        { status: 401 }
      );
    }

    if (role === 'admin' && user.role !== 'admin') {
      recordFailedLogin(rateLimitKey);
      await logAuthAudit('login_failed', {
        identifier: normalizedEmail,
        roleRequested: role,
        userId: user._id.toString(),
        ip,
        userAgent,
        reason: 'role_mismatch',
      });
      await maybeRaiseMultiIpFailedLoginAlert(db, normalizedEmail);
      return NextResponse.json(
        { ok: false, message: 'This account is not an admin account.' },
        { status: 403 }
      );
    }

    if (role === 'trainee' && user.role === 'admin') {
      recordFailedLogin(rateLimitKey);
      await logAuthAudit('login_failed', {
        identifier: normalizedEmail,
        roleRequested: role,
        userId: user._id.toString(),
        ip,
        userAgent,
        reason: 'role_mismatch',
      });
      return NextResponse.json(
        { ok: false, message: 'This account is an admin account. Please switch to the Admin tab.' },
        { status: 403 }
      );
    }

    if (typeof user.passwordHash !== 'string' || !verifySecret(password, user.passwordHash)) {
      recordFailedLogin(rateLimitKey);
      await logAuthAudit('login_failed', {
        identifier: normalizedEmail,
        roleRequested: role,
        userId: user._id.toString(),
        ip,
        userAgent,
        reason: 'invalid_password',
      });
      await maybeRaiseMultiIpFailedLoginAlert(db, normalizedEmail);
      return NextResponse.json(
        { ok: false, message: 'Incorrect email or password. Please try again.' },
        { status: 401 }
      );
    }

    clearLoginAttempts(rateLimitKey);
    await logAuthAudit('login_success', {
      identifier: normalizedEmail,
      roleRequested: role,
      userId: user._id.toString(),
      ip,
      userAgent,
    });

    const session = await createSession(db, user._id.toString(), request.headers.get('user-agent') || undefined);

    const response = NextResponse.json({
      ok: true,
      message: 'Login successful.',
      user: {
        id: user._id.toString(),
        fullName: typeof user.fullName === 'string' ? user.fullName : 'User',
        email: typeof user.email === 'string' ? user.email : undefined,
        phone: typeof user.phone === 'string' ? user.phone : undefined,
        role: typeof user.role === 'string' ? user.role : 'trainee',
      },
    });

    applySessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to login.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
