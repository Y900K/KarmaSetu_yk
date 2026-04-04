import { NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/db/collections';
import { hashSecret, verifySecret } from '@/lib/auth/security';
import { getPasswordPolicyError } from '@/lib/auth/passwordPolicy';
import { requireTrainee } from '@/lib/auth/requireTrainee';

type PasswordBody = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  try {
    const trainee = await requireTrainee(request);
    if (!trainee.ok) {
      return trainee.response;
    }

    const { db, session } = trainee;

    const body = (await request.json().catch(() => ({}))) as PasswordBody;
    const currentPassword = body.currentPassword?.trim();
    const newPassword = body.newPassword?.trim();
    const confirmPassword = body.confirmPassword?.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ ok: false, message: 'All password fields are required.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ ok: false, message: 'New password and confirm password do not match.' }, { status: 400 });
    }

    const passwordError = getPasswordPolicyError(newPassword);
    if (passwordError) {
      return NextResponse.json({ ok: false, message: passwordError }, { status: 400 });
    }

    if (typeof session.user.passwordHash !== 'string' || !verifySecret(currentPassword, session.user.passwordHash)) {
      return NextResponse.json({ ok: false, message: 'Current password is incorrect.' }, { status: 401 });
    }

    await db.collection(COLLECTIONS.users).updateOne(
      { _id: session.user._id },
      {
        $set: {
          passwordHash: hashSecret(newPassword),
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({ ok: true, message: 'Password updated successfully.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to update password.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
