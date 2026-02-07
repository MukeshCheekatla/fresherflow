'use client';

import { useTheme } from '@/contexts/ThemeContext';
import SunIcon from '@heroicons/react/24/outline/SunIcon';
import MoonIcon from '@heroicons/react/24/outline/MoonIcon';
import { useState, useEffect } from 'react';

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10.5 h-10.5" />; // Placeholder to prevent mismatch
    }

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? (
                <MoonIcon className="w-5.5 h-5.5" />
            ) : (
                <SunIcon className="w-5.5 h-5.5" />
            )}
        </button>
    );
}

