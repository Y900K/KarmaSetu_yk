import { NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(request: Request, { params }: { params: Promise<{ certNo: string }> }) {
  try {
    const admin = await requireAdmin(request);
    if (!admin.ok) {
      return admin.response;
    }

    const { db } = admin;
    const { certNo } = await params;
    if (!certNo) {
      return NextResponse.json({ ok: false, message: 'Certificate number is required.' }, { status: 400 });
    }

    const result = await db.collection(COLLECTIONS.certificates).updateOne(
      { certNo },
      {
        $set: {
          status: 'revoked',
          revokedAt: new Date(),
        },
      }
    );

    if (!result.matchedCount) {
      return NextResponse.json({ ok: false, message: 'Certificate not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, message: 'Certificate revoked.' });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to revoke certificate.',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
