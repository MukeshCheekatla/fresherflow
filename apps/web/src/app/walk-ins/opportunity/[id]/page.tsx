import { redirect } from 'next/navigation';

type LegacyWalkInRouteProps = {
    params: {
        id: string;
    };
};

export default function LegacyWalkInRoute({ params }: LegacyWalkInRouteProps) {
    redirect(`/walk-ins/details/${params.id}`);
}
