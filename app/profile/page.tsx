import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isLearnerRole } from '@/lib/auth/learnerRoles';
import { resolveSessionUser } from '@/lib/auth/session';
import { getMongoDb } from '@/lib/mongodb';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  if (!cookieHeader) {
    redirect('/login');
  }

  let targetRoute = '/login';

  try {
    const db = await getMongoDb();
    const fakeReq = new Request('http://localhost', {
      headers: { cookie: cookieHeader },
    });
    const session = await resolveSessionUser(db, fakeReq);

    if (session?.user?.role === 'admin') {
      targetRoute = '/admin/profile';
    } else if (session?.user && isLearnerRole(session.user.role)) {
      targetRoute = '/trainee/profile';
    }
  } catch {
    targetRoute = '/login';
  }

  redirect(targetRoute);
}
