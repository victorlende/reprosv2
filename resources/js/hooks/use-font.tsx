import { useCallback, useEffect, useState } from 'react';

export type Font = 'inter' | 'google-sans' | 'jetbrains-mono';

const applyFont = (font: Font) => {
    document.documentElement.setAttribute('data-font', font);
};

export function initializeFont() {
    const savedFont =
        (localStorage.getItem('font-preference') as Font) || 'google-sans';

    applyFont(savedFont);
}

export function useFont() {
    const [font, setFont] = useState<Font>('google-sans');

    const updateFont = useCallback((newFont: Font) => {
        setFont(newFont);

        // Store in localStorage
        localStorage.setItem('font-preference', newFont);

        // Store in cookie for potential SSR usage (optional but consistent with appearance)
        document.cookie = `font-preference=${newFont};path=/;max-age=31536000;SameSite=Lax`;

        applyFont(newFont);
    }, []);

    useEffect(() => {
        const savedFont = localStorage.getItem('font-preference') as Font | null;
        if (savedFont) {
            setFont(savedFont);
            applyFont(savedFont);
        } else {
            // Default
            applyFont('google-sans');
        }
    }, []);

    return { font, updateFont } as const;
}
