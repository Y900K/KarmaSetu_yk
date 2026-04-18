import { NextResponse } from 'next/server';
import { requireTrainee } from '@/lib/auth/requireTrainee';
import { COLLECTIONS } from '@/lib/db/collections';
import { dedupeEnrollmentsByCourse } from '@/lib/enrollmentMetrics';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const auth = await requireTrainee(request);
    if (!auth.ok) {
      return auth.response;
    }

    const { db, session } = auth;
    const userId = session.user._id.toString();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '30d';

    // 1. Fetch all enrollments for this user
    const rawEnrollments = await db
      .collection(COLLECTIONS.enrollments)
      .find({ userId })
      .toArray();
    const enrollments = dedupeEnrollmentsByCourse(rawEnrollments);

    const validCourseIds = enrollments
      .map(e => typeof e.courseId === 'string' ? e.courseId : '')
      .filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    const courseIds = validCourseIds.map(id => new ObjectId(id));
    const courses = courseIds.length > 0
      ? await db.collection(COLLECTIONS.courses).find({ _id: { $in: courseIds } }).toArray()
      : [];

    const courseMap = new Map(courses.map(c => [c._id.toString(), c]));

    // 2. Configure Timeframe
    let startDate: Date | null = null;
    const now = new Date();
    if (timeframe === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '90d') {
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const auditMatch: Record<string, any> = { userId };
    if (startDate) {
      auditMatch.createdAt = { $gte: startDate };
    }

    const auditLogs = await db
      .collection(COLLECTIONS.enrollmentAudit)
      .find(auditMatch)
      .sort({ createdAt: 1 })
      .toArray();

    // 3. Process Radar Data (Course Progress)
    const radarData = enrollments.slice(0, 6).map(e => ({
      subject: courseMap.get(e.courseId)?.title || 'Course',
      A: e.progressPct || 0,
      fullMark: 100,
    }));

    // 4. Process Line Data (Quiz Scores History)
    const scoreHistory = auditLogs
      .filter(log => log.action === 'completed' && typeof log.score === 'number')
      .map(log => ({
        date: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: log.score
      }));

    // 5. Process Bar Data (Activity Trend for the chosen period)
    const dailyInteractions: Record<string, number> = {};
    const logInterval = timeframe === 'all' ? 30 : timeframe === '90d' ? 90 : timeframe === '30d' ? 30 : 7;
    
    for (let i = logInterval - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dailyInteractions[label] = 0;
    }

    auditLogs.forEach(log => {
      const label = new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyInteractions[label] !== undefined) {
        dailyInteractions[label]++;
      }
    });

    const activityData = Object.entries(dailyInteractions).map(([name, interactions]) => ({
      name,
      interactions
    }));

    // 6. Stats Summary
    const totalCerts = await db.collection(COLLECTIONS.certificates).countDocuments({ userId, status: 'valid' });
    const avgScore = enrollments.length > 0 
      ? Math.round(enrollments.reduce((acc, e) => acc + (e.score || 0), 0) / enrollments.length)
      : 0;

    // 7. Generate Insights
    const insights: string[] = [];
    const interactionCount = auditLogs.length;
    
    if (interactionCount > 20) {
      insights.push(`High Momentum: You've had ${interactionCount} interactions in this period. Great learning velocity!`);
    } else if (interactionCount === 0) {
      insights.push("Dormant Period: No recent training activity. Resuming a module will restore your streak.");
    }

    const recentScores = scoreHistory.map(s => s.score);
    if (recentScores.length >= 2) {
      const last = recentScores[recentScores.length - 1];
      const prev = recentScores[recentScores.length - 2];
      if (last > prev) {
        insights.push(`Upward Trend: Your last assessment score (${last}%) improved over the previous one.`);
      }
    }

    if (totalCerts > 0) {
      insights.push(`Certified Professional: You hold ${totalCerts} valid industrial certifications. Keep it up!`);
    }

    return NextResponse.json({
      ok: true,
      stats: {
        avgScore,
        coursesCompleted: enrollments.filter(e => e.status === 'completed').length,
        totalInteractions: interactionCount,
        certificates: totalCerts,
      },
      charts: {
        radar: radarData,
        line: scoreHistory,
        bar: activityData,
      },
      insights
    });

  } catch (error) {
    console.error('Trainee Analytics API Error:', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}
