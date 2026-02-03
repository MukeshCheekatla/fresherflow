import { redirect } from 'next/navigation';

export default function AdminJobsRedirect() {
    redirect('/admin/opportunities?type=job');
}
