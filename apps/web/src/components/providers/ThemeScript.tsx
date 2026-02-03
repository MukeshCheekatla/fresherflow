'use client';

/**
 * ThemeScript Component
 * 
 * This component injects a small script into the head of the document to prevent
 * the "white flash" on page reloads when using dark mode.
 * 
 * It runs BEFORE React hydrates, checking localStorage and system preferences
 * to apply the 'dark' class to the <html> element immediately.
 */
export function ThemeScript() {
    const scriptContent = `
        (function() {
            try {
                const savedTheme = localStorage.getItem('theme');
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                const theme = savedTheme || systemTheme;
                
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            } catch (e) {
                console.error('Theme synchronization failed:', e);
            }
        })();
    `;

    return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}
