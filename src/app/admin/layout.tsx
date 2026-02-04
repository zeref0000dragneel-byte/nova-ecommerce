import { isAuthenticated, clearAdminSession } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

async function handleLogout() {
  'use server';
  await clearAdminSession();
  redirect('/admin/login');
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = await isAuthenticated();

  return (
    <AdminShell authenticated={!!authenticated} logoutAction={handleLogout}>
      {children}
    </AdminShell>
  );
}
