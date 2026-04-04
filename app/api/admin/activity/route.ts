import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit') || '10');

    // Fetch only fields needed by the activity cards to keep payload small.
    const [enrollments, certificates] = await Promise.all([
      db.collection(COLLECTIONS.enrollments)
        .find({})
        .project({ userId: 1, courseId: 1, assignedAt: 1, updatedAt: 1 })
        .sort({ updatedAt: -1, assignedAt: -1 })
        .limit(limit)
        .toArray(),
      db.collection(COLLECTIONS.certificates)
        .find({})
        .project({ issuedAt: 1, userId: 1, courseId: 1, score: 1 })
        .sort({ issuedAt: -1 })
        .limit(limit)
        .toArray()
    ]);

    const userIds = new Set<string>();
    const courseIds = new Set<string>();

    for (const enrollment of enrollments) {
      if (typeof enrollment.userId === 'string' && ObjectId.isValid(enrollment.userId)) {
        userIds.add(enrollment.userId);
      }
      if (typeof enrollment.courseId === 'string' && ObjectId.isValid(enrollment.courseId)) {
        courseIds.add(enrollment.courseId);
      }
    }

    for (const certificate of certificates) {
      if (typeof certificate.userId === 'string' && ObjectId.isValid(certificate.userId)) {
        userIds.add(certificate.userId);
      }
      if (typeof certificate.courseId === 'string' && ObjectId.isValid(certificate.courseId)) {
        courseIds.add(certificate.courseId);
      }
    }

    const [users, courses] = await Promise.all([
      userIds.size > 0
        ? db
            .collection(COLLECTIONS.users)
            .find({ _id: { $in: Array.from(userIds, (id) => new ObjectId(id)) } })
            .project({ fullName: 1 })
            .toArray()
        : Promise.resolve([]),
      courseIds.size > 0
        ? db
            .collection(COLLECTIONS.courses)
            .find({ _id: { $in: Array.from(courseIds, (id) => new ObjectId(id)) } })
            .project({ title: 1 })
            .toArray()
        : Promise.resolve([]),
    ]);

    const userNameById = new Map<string, string>(
      users.map((user) => [
        user._id.toString(),
        typeof user.fullName === 'string' && user.fullName.trim().length > 0 ? user.fullName : 'Trainee',
      ])
    );

    const courseTitleById = new Map<string, string>(
      courses.map((course) => [
        course._id.toString(),
        typeof course.title === 'string' && course.title.trim().length > 0 ? course.title : 'Course',
      ])
    );

    const enrollmentEvents = enrollments.map((e) => {
      const ts = e.updatedAt instanceof Date
        ? e.updatedAt.getTime()
        : e.assignedAt instanceof Date
        ? e.assignedAt.getTime()
        : 0;
      const traineeName =
        typeof e.userId === 'string' ? userNameById.get(e.userId) || 'Trainee' : 'Trainee';
      const courseName =
        typeof e.courseId === 'string' ? courseTitleById.get(e.courseId) || 'Course' : 'Course';

      return {
        icon: '📝',
        text: `New enrollment: ${traineeName} started ${courseName}`,
        time: ts > 0 ? new Date(ts).toLocaleDateString() : 'Today',
        color: 'blue',
        ts,
      };
    });

    const certificateEvents = certificates.map((c) => {
      const ts = c.issuedAt instanceof Date ? c.issuedAt.getTime() : 0;
      const traineeName =
        typeof c.userId === 'string' ? userNameById.get(c.userId) || 'Trainee' : 'Trainee';
      const courseName =
        typeof c.courseId === 'string' ? courseTitleById.get(c.courseId) || 'Course' : 'Course';

      return {
        icon: '🎓',
        text: `${traineeName} earned certificate in ${courseName}`,
        time: ts > 0 ? new Date(ts).toLocaleDateString() : 'Recently',
        score: `${c.score}%`,
        color: 'green',
        ts,
      };
    });

    // Merge two already-sorted arrays in O(n) and keep only requested limit.
    const activity: Array<{ icon: string; text: string; time: string; score?: string; color: string; ts: number }> = [];
    let i = 0;
    let j = 0;

    while (activity.length < limit && (i < enrollmentEvents.length || j < certificateEvents.length)) {
      const nextEnrollment = i < enrollmentEvents.length ? enrollmentEvents[i] : null;
      const nextCertificate = j < certificateEvents.length ? certificateEvents[j] : null;

      if (nextEnrollment && (!nextCertificate || nextEnrollment.ts >= nextCertificate.ts)) {
        activity.push(nextEnrollment);
        i += 1;
      } else if (nextCertificate) {
        activity.push(nextCertificate);
        j += 1;
      }
    }

    return NextResponse.json({
      ok: true,
      activity: activity.map((entry) => {
        const { ts, ...rest } = entry;
        return ts ? rest : rest;
      }),
    });
  } catch {
    return NextResponse.json({ ok: false, message: 'Failed to fetch activity' }, { status: 500 });
  }
}
