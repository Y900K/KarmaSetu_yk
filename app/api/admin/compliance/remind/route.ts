import { NextResponse } from 'next/server';
import { COLLECTIONS } from '@/lib/db/collections';
import { requireSecureAdminMutation } from '@/lib/security/requireSecureAdminMutation';
import { logSystemEvent } from '@/lib/utils/logger';

export async function POST(request: Request) {
  try {
    const admin = await requireSecureAdminMutation(request, 'admin_compliance_remind');
    if (!admin.ok) {
      return admin.response;
    }

    const { db, session } = admin;
    const body = await request.json().catch(() => ({}));
    const { traineeName, traineeDept, courseTitle, daysOverdue, customMessage } = body;

    const title = `Compliance Reminder: ${courseTitle || 'Required Training'}`;
    const message = customMessage || `${traineeName || 'Trainee'} in ${traineeDept || 'General'} is ${daysOverdue || 0} days overdue for "${courseTitle || 'Safety Training'}". Immediate completion is required.`;

    const now = new Date();

    // 1. Add to admin notifications log
    await db.collection(COLLECTIONS.adminNotifications).insertOne({
      type: 'compliance_reminder',
      title,
      message,
      status: 'unread',
      recipientRole: 'trainee',
      targetName: traineeName || 'All Overdue',
      targetDept: traineeDept || 'General',
      createdBy: session.user._id.toString(),
      createdAt: now,
    });

    // 2. Add high-priority announcement for target department
    await db.collection(COLLECTIONS.adminAnnouncements).insertOne({
      title,
      message,
      priority: daysOverdue && daysOverdue > 14 ? 'URGENT' : 'HIGH',
      sentTo: traineeDept ? [traineeDept] : ['All Departments'],
      status: 'active',
      author: session.user.name || 'Safety & Compliance Admin',
      createdAt: now,
    });

    await logSystemEvent(
      'INFO',
      'compliance_remind',
      `Compliance reminder dispatched for ${traineeName || 'department'} (${courseTitle}).`,
      { actorAdminId: session.user._id.toString(), traineeName, courseTitle, daysOverdue },
      session.user._id.toString()
    );

    return NextResponse.json({
      ok: true,
      message: `Compliance reminder directive dispatched successfully for ${traineeName || 'personnel'}.`,
    });
  } catch (error) {
    await logSystemEvent('ERROR', 'compliance_remind', 'Failed to dispatch compliance reminder', { error });
    return NextResponse.json({ ok: false, message: 'Failed to dispatch compliance reminder.' }, { status: 500 });
  }
}
