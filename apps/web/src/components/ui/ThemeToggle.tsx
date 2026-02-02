'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <MoonIcon className="w-[22px] h-[22px]" />
            ) : (
                <SunIcon className="w-[22px] h-[22px]" />
            )}
        </button>
    );
}
