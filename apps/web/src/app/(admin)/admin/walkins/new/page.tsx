import { redirect } from 'next/navigation';

export default function AdminWalkinsNewRedirect() {
    redirect('/admin/opportunities/create?type=WALKIN');
}
