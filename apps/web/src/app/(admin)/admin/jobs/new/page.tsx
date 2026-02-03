import { redirect } from 'next/navigation';

export default function AdminJobsNewRedirect() {
    redirect('/admin/opportunities/create?type=JOB');
}
