import { redirect } from 'next/navigation';

export default function AdminWalkinsRedirect() {
    redirect('/admin/opportunities?type=WALKIN');
}
