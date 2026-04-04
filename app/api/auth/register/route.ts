import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS, type UserRole } from '@/lib/db/collections';
import { createSession, applySessionCookie } from '@/lib/auth/session';
import { hashSecret, normalizeEmail } from '@/lib/auth/security';
import { getPasswordPolicyError } from '@/lib/auth/passwordPolicy';

const ALLOWED_ROLES = new Set<UserRole>(['trainee', 'operator', 'contractor', 'hse', 'manager', 'admin']);

type RegisterRequest = {
  fullName?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  department?: string;
  company?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterRequest;

    const fullName = body.fullName?.trim();
    const email = body.email ? normalizeEmail(body.email) : undefined;
    const password = body.password?.trim();
    const role = body.role && ALLOWED_ROLES.has(body.role) ? body.role : 'trainee';

    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ ok: false, message: 'Full name is required.' }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ ok: false, message: 'Email is required.' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { ok: false, message: 'Password is required.' },
        { status: 400 }
      );
    }

    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      return NextResponse.json({ ok: false, message: passwordError }, { status: 400 });
    }

    const db = await getMongoDb();
    const users = db.collection(COLLECTIONS.users);

    const duplicate = await users.findOne({
      email,
    });

    if (duplicate) {
      return NextResponse.json(
        { ok: false, message: 'User already exists with this email.' },
        { status: 409 }
      );
    }

    const now = new Date();
    const result = await users.insertOne({
      fullName,
      email,
      passwordHash: password ? hashSecret(password) : undefined,
      role,
      department: body.department?.trim() || undefined,
      company: body.company?.trim() || undefined,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    const userId = result.insertedId.toString();
    const session = await createSession(db, userId, request.headers.get('user-agent') || undefined);

    const response = NextResponse.json({
      ok: true,
      message: 'Registration successful.',
      user: {
        id: userId,
        fullName,
        email,
        role,
      },
    });

    applySessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to register user.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
