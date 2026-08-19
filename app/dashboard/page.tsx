import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { resolveSessionUser } from '@/lib/auth/session';
import { getMongoDb } from '@/lib/mongodb';

export default async function DashboardRootPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  
  if (!cookieHeader) {
    redirect('/login');
  }

  try {
    const db = await getMongoDb();
    const fakeReq = new Request('http://localhost', {
      headers: { cookie: cookieHeader },
    });
    const session = await resolveSessionUser(db, fakeReq);
    
    if (session?.user?.role === 'admin') {
      redirect('/admin/dashboard');
    }
    if (session?.user) {
      redirect('/trainee/dashboard');
    }
  } catch {
    // If DB check fails or no session, fallback to login
  }

  redirect('/login');
}
