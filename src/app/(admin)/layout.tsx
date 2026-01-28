'use client';

import LoadingScreen from "@/shared/components/ui/LoadingScreen";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [isAdmin, loading, router]);

    if (loading) return <LoadingScreen message="Checking Authorization..." />;
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen pb-16 md:pb-0">
            {children}
            <AdminBottomNav />
        </div>
    );
}
