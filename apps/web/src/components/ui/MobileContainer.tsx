import { cn } from "@/lib/utils";

interface MobileContainerProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Mobile-First Container
 * 
 * HARD RULES:
 * - max-width: 400px (real mobile comfort zone)
 * - padding: 1rem (16px) - 8pt grid
 * - Use for PWA screens, mobile-first layouts
 */
export function MobileContainer({ children, className }: MobileContainerProps) {
    return (
        <div className={cn("mx-auto w-full max-w-[400px] px-4", className)}>
            {children}
        </div>
    );
}
