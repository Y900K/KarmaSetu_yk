import { NextResponse } from 'next/server';
import { COLLECTIONS, type UserRole } from '@/lib/db/collections';
import { hashSecret, normalizeEmail, normalizePhone } from '@/lib/auth/security';
import { getPasswordPolicyError } from '@/lib/auth/passwordPolicy';
import { requireAdmin } from '@/lib/auth/requireAdmin';

type CreateUserBody = {
  name?: string;
  role?: string;
  dept?: string;
  phone?: string;
  email?: string;
  password?: string;
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  progress: number;
  status: 'Active' | 'Overdue' | 'Inactive';
  lastLogin: string;
  phone: string;
};

const USER_ROLE_MAP: Record<string, UserRole> = {
  'Worker / Operator': 'operator',
  'Supervisor / Team Lead': 'manager',
  'Manager / Department Head': 'manager',
  'Safety Officer': 'hse',
  'HR / Admin': 'admin',
};

function roleToDisplay(value: unknown): string {
  if (typeof value !== 'string') {
    return 'Worker / Operator';
  }

  switch (value) {
    case 'admin':
      return 'HR / Admin';
    case 'manager':
      return 'Manager / Department Head';
    case 'hse':
      return 'Safety Officer';
    case 'operator':
      return 'Worker / Operator';
    case 'contractor':
      return 'Worker / Operator';
    case 'trainee':
    default:
      return 'Worker / Operator';
  }
}

function computeStatus(isActive: unknown, progress: number): 'Active' | 'Overdue' | 'Inactive' {
  if (!isActive) {
    return 'Inactive';
  }

  if (progress < 40) {
    return 'Overdue';
  }

  return 'Active';
}

function formatLastLogin(updatedAt: unknown): string {
  if (!(updatedAt instanceof Date)) {
    return 'Never';
  }

  return updatedAt.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;

    const [users, enrollmentStats] = await Promise.all([
      db.collection(COLLECTIONS.users).find({}).sort({ createdAt: -1 }).toArray(),
      db
        .collection(COLLECTIONS.enrollments)
        .aggregate<{ _id: string; avgProgress: number }>([
          {
            $group: {
              _id: '$userId',
              avgProgress: { $avg: '$progressPct' },
            },
          },
        ])
        .toArray(),
    ]);

    const progressMap = new Map<string, number>(
      enrollmentStats.map((entry) => [entry._id, Math.round(entry.avgProgress || 0)])
    );

    const rows: UserRow[] = users.map((user) => {
      const id = user._id.toString();
      const progress = progressMap.get(id) || 0;

      return {
        id,
        name: typeof user.fullName === 'string' ? user.fullName : 'User',
        email: typeof user.email === 'string' ? user.email : '-',
        department: typeof user.department === 'string' ? user.department : 'General',
        role: roleToDisplay(user.role),
        progress,
        status: computeStatus(user.isActive, progress),
        lastLogin: formatLastLogin(user.updatedAt),
        phone: typeof user.phone === 'string' ? user.phone : '-',
      };
    });

    return NextResponse.json({ ok: true, users: rows });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to load users.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;

    const body = (await request.json()) as CreateUserBody;
    const name = body.name?.trim();
    const email = body.email ? normalizeEmail(body.email) : undefined;
    const phone = body.phone ? normalizePhone(body.phone) : undefined;
    const password = body.password?.trim();

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Name, email and password are required.' },
        { status: 400 }
      );
    }

    const passwordError = getPasswordPolicyError(password);
    if (passwordError) {
      return NextResponse.json({ ok: false, message: passwordError }, { status: 400 });
    }

    const users = db.collection(COLLECTIONS.users);

    const duplicate = await users.findOne({
      $or: [
        { email },
        ...(phone ? [{ phone }] : []),
      ],
    });

    if (duplicate) {
      return NextResponse.json(
        { ok: false, message: 'User already exists with this email or phone.' },
        { status: 409 }
      );
    }

    const role = USER_ROLE_MAP[body.role || ''] || 'trainee';
    const now = new Date();

    const result = await users.insertOne({
      fullName: name,
      email,
      phone,
      passwordHash: hashSecret(password),
      role,
      department: body.dept?.trim() || 'General',
      company: 'KarmaSetu',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      message: 'User created successfully.',
      userId: result.insertedId.toString(),
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to create user.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
