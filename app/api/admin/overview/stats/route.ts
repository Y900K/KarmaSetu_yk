import { NextResponse } from 'next/server';
import { getMongoDb } from '@/lib/mongodb';
import { COLLECTIONS } from '@/lib/db/collections';
import { resolveSessionUser } from '@/lib/auth/session';

type DistributionEntry = { hasOverdue: boolean; hasInProgress: boolean };
type CourseStats = { total: number; completed: number };

export async function GET(request: Request) {
  try {
    const db = await getMongoDb();
    const session = await resolveSessionUser(db, request);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ ok: false, message: 'Admin access denied.' }, { status: 403 });
    }

    // Aggregate Stats using narrow projections to reduce payload and CPU work.
    const [
      totalTrainees,
      activeCoursesCount,
      totalCertificates,
      enrollments,
      totalCourses,
      allCourses,
      allTrainees,
    ] = await Promise.all([
      db.collection(COLLECTIONS.users).countDocuments({ role: 'trainee' }),
      db.collection(COLLECTIONS.courses).countDocuments({ isPublished: true, isDeleted: { $ne: true } }),
      db.collection(COLLECTIONS.certificates).countDocuments({ status: { $ne: 'revoked' } }),
      db.collection(COLLECTIONS.enrollments).find({}).project({ userId: 1, courseId: 1, status: 1, department: 1 }).toArray(),
      db.collection(COLLECTIONS.courses).countDocuments({ isDeleted: { $ne: true } }),
      db.collection(COLLECTIONS.courses).find({ isDeleted: { $ne: true } }).project({ _id: 1, title: 1, modulesCount: 1, deadline: 1 }).toArray(),
      db.collection(COLLECTIONS.users).find({ role: 'trainee' }).project({ _id: 1, fullName: 1, isActive: 1, department: 1 }).toArray(),
    ]);

    const traineeEnrollmentMap = new Map<string, DistributionEntry>();
    const userDeptMap = new Map<string, string>();
    const userNameMap = new Map<string, string>();
    const courseMap = new Map<string, { title: string; deadlineMs?: number }>();
    const deptMap = new Map<string, { total: number; completed: number }>();
    const completionByCourse = new Map<string, CourseStats>();
    const overdueRows: Array<{ userId: string; dept: string; course: string; daysOverdue: number }> = [];

    const now = new Date();
    const nowMs = now.getTime();

    for (const trainee of allTrainees) {
      const uid = trainee._id.toString();
      userDeptMap.set(
        uid,
        typeof trainee.department === 'string' && trainee.department.trim() ? trainee.department : 'Unassigned'
      );
      userNameMap.set(uid, typeof trainee.fullName === 'string' && trainee.fullName.trim() ? trainee.fullName : 'Unknown Trainee');
    }

    for (const course of allCourses) {
      const cid = course._id.toString();
      const title = typeof course.title === 'string' && course.title.trim() ? course.title : 'Untitled Course';
      if (course.deadline) {
        const deadlineMs = (course.deadline instanceof Date ? course.deadline : new Date(course.deadline)).getTime();
        courseMap.set(cid, { title, deadlineMs });
      } else {
        courseMap.set(cid, { title });
      }
      completionByCourse.set(cid, { total: 0, completed: 0 });
    }

    for (const enrollment of enrollments) {
      const uid = typeof enrollment.userId === 'string' ? enrollment.userId : '';
      if (!uid) continue;

      if (!traineeEnrollmentMap.has(uid)) {
        traineeEnrollmentMap.set(uid, { hasOverdue: false, hasInProgress: false });
      }

      const entry = traineeEnrollmentMap.get(uid);
      if (!entry) continue;

      const status = typeof enrollment.status === 'string' ? enrollment.status.toLowerCase() : '';
      const courseId = typeof enrollment.courseId === 'string' ? enrollment.courseId : '';
      const dept = (typeof enrollment.department === 'string' && enrollment.department.trim())
        ? enrollment.department
        : userDeptMap.get(uid) || 'Unassigned';

      if (!deptMap.has(dept)) {
        deptMap.set(dept, { total: 0, completed: 0 });
      }
      const deptStats = deptMap.get(dept);
      if (deptStats) {
        deptStats.total++;
      }

      if (completionByCourse.has(courseId)) {
        const courseStats = completionByCourse.get(courseId);
        if (courseStats) {
          courseStats.total++;
          if (status === 'completed') {
            courseStats.completed++;
          }
        }
      }

      if (status === 'completed') {
        if (deptStats) {
          deptStats.completed++;
        }
        continue;
      }

      if (status === 'in_progress') {
        entry.hasInProgress = true;
      }

      const courseData = courseMap.get(courseId);
      if (courseData?.deadlineMs && courseData.deadlineMs < nowMs) {
        entry.hasOverdue = true;
        overdueRows.push({
          userId: uid,
          dept,
          course: courseData.title,
          daysOverdue: Math.ceil((nowMs - courseData.deadlineMs) / (1000 * 60 * 60 * 24)),
        });
      }
    }

    let activeCount = 0;
    let overdueCount = 0;
    let inactiveCount = 0;

    for (const trainee of allTrainees) {
      const uid = trainee._id.toString();
      const isActiveTrainee = trainee.isActive !== false;

      if (!isActiveTrainee) {
        inactiveCount++;
      } else {
        const enrollmentInfo = traineeEnrollmentMap.get(uid);
        if (enrollmentInfo?.hasOverdue) {
          overdueCount++;
        } else {
          activeCount++;
        }
      }
    }

    const completedEnrollments = enrollments.filter((e) => typeof e.status === 'string' && e.status.toLowerCase() === 'completed').length;
    const totalEnrollments = enrollments.length;
    const complianceRate = totalEnrollments > 0 
      ? Math.round((completedEnrollments / totalEnrollments) * 100) 
      : 0;

    const completionRates = Array.from(completionByCourse.entries())
      .map(([courseIdStr, stats]) => {
        const enrollmentCount = stats.total;
        const rate = enrollmentCount > 0 ? Math.round((stats.completed / enrollmentCount) * 100) : 0;
        const courseData = courseMap.get(courseIdStr);
        return {
          name: courseData?.title || 'Untitled Course',
          value: rate,
          enrollmentCount,
        };
      })
      .sort((a, b) => {
        if (b.enrollmentCount !== a.enrollmentCount) return b.enrollmentCount - a.enrollmentCount;
        return b.value - a.value;
      })
      .slice(0, 15)
      .map(({ name, value }) => ({ name, value }));

    const overdueList = overdueRows
      .map((row) => ({
        name: userNameMap.get(row.userId) || 'Unknown Trainee',
        dept: row.dept,
        course: row.course,
        daysOverdue: row.daysOverdue,
      }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    const deptCompliance = Array.from(deptMap.entries()).map(([name, stats]) => ({
      name,
      compliance: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
      status: (stats.completed / stats.total) >= 0.8 ? 'Compliant' : 'Warning'
    }));

    // Performance Insights
    const avgModules = allCourses.length > 0 
      ? Math.round(allCourses.reduce((sum, c) => sum + (typeof c.modulesCount === 'number' ? c.modulesCount : 0), 0) / allCourses.length) 
      : 0;

    return NextResponse.json({
      ok: true,
      stats: {
        totalTrainees,
        activeCourses: activeCoursesCount,
        validCertificates: totalCertificates,
        compliance: `${complianceRate}%`,
        overdueTrainees: overdueCount,
        overdueList: overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue),
        totalCourses,
        distribution: [
          { name: 'Active', value: activeCount, color: '#10b981' },
          { name: 'Overdue', value: overdueCount, color: '#ef4444' },
          { name: 'Inactive', value: inactiveCount, color: '#475569' },
        ],
        completionRates,
        deptCompliance,
        performanceInsights: [
          { value: `${complianceRate}%`, label: 'ASSIGNMENT PASS RATE', color: '#f59e0b' },
          { value: `${activeCoursesCount}`, label: 'ACTIVE COURSES', color: '#06b6d4' },
          { value: `${avgModules}`, label: 'AVG MODULES/COURSE', color: '#f8fafc' },
          { value: `${totalTrainees > 0 ? Math.round((totalCertificates / totalTrainees) * 100) / 100 : 0}`, label: 'CERTIFICATES/TRAINEE', color: '#10b981' },
        ]
      }
    });
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        ok: false,
        message: 'Failed to fetch admin stats',
        details: process.env.NODE_ENV === 'development' ? details : undefined,
      },
      { status: 500 }
    );
  }
}
