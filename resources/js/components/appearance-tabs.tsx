import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { useFont } from '@/hooks/use-font';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react';
import { HTMLAttributes } from 'react';

export default function AppearanceToggleTab({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { font, updateFont } = useFont();

    const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    const fonts: { value: import('@/hooks/use-font').Font; label: string; class: string }[] = [
        { value: 'google-sans', label: 'Google Sans', class: 'font-google-sans' },
        { value: 'inter', label: 'Inter', class: 'font-inter' },
        { value: 'jetbrains-mono', label: 'JetBrains Mono', class: 'font-none' },
    ];

    return (
        <div className={cn('flex flex-col gap-6', className)} {...props}>
            <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Theme</div>
                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800">
                    {tabs.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center rounded-md px-3.5 py-1.5 transition-colors',
                                appearance === value
                                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                            )}
                        >
                            <Icon className="-ml-1 h-4 w-4" />
                            <span className="ml-1.5 text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <div className="text-sm font-medium text-muted-foreground">Font</div>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {fonts.map(({ value, label, class: fontClass }) => (
                        <button
                            key={value}
                            onClick={() => updateFont(value)}
                            className={cn(
                                'flex h-12 items-center justify-center rounded-lg border-2 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800',
                                font === value
                                    ? 'border-neutral-950 bg-neutral-50 dark:border-white dark:bg-neutral-800'
                                    : 'border-transparent bg-white shadow-sm hover:border-neutral-200 dark:bg-neutral-900 dark:hover:border-neutral-700',
                            )}
                        >
                            <span className={cn("text-sm", fontClass === 'font-inter' ? 'font-[Inter]' : 'font-sans')}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
