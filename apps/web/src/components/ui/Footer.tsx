import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FooterProps {
    className?: string;
}

export function Footer({ className }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={cn("border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-6 md:py-8 mt-auto", className)}>
            <div className="container px-4 md:px-6 flex flex-col items-center justify-center gap-4 text-center mx-auto">
                <p className="text-xs text-muted-foreground">
                    &copy; {currentYear} FresherFlow. All rights reserved.
                </p>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                    <span className="text-muted-foreground/40">|</span>
                    <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
                    <span className="text-muted-foreground/40">|</span>
                    <Link href="/account/feedback" className="hover:text-foreground transition-colors">Feedback</Link>
                </div>
                <div className="text-[10px] text-muted-foreground/60 max-w-md space-y-1">
                    <p>
                        Company names and logos are trademarks of their respective owners.
                        FresherFlow is not affiliated with or endorsed by these companies.
                    </p>
                </div>
            </div>
        </footer>
    );
}
