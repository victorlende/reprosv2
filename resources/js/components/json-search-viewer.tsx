import { useState } from 'react';
import { Editor } from '@monaco-editor/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Check, Copy, Download, Braces, Maximize2, Minimize2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from 'next-themes';

interface JsonSearchViewerProps {
    data: any;
    title: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function JsonSearchViewer({ data, title, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: JsonSearchViewerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalIsOpen;
    const setIsOpen = isControlled ? setControlledOpen! : setInternalIsOpen;

    // Determine theme for Monaco
    // Note: next-themes provides 'theme' but we need to map it to monaco 'vs-dark' or 'light'
    // This might be tricky if "system" is selected. A simple toggle or checking 'dark' class on <html> is robust.
    const { theme, systemTheme } = useTheme();
    const currentTheme = theme === 'system' ? systemTheme : theme;
    const monacoTheme = currentTheme === 'dark' ? 'vs-dark' : 'light';

    const handleDownload = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${cleanTitle}_data.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        const text = JSON.stringify(data, null, 2);
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent
                className={cn(
                    "flex flex-col p-0 gap-0 overflow-hidden border border-border/60 shadow-2xl backdrop-blur-xl transition-all duration-300",
                    isFullscreen
                        ? "w-[100vw] h-[100vh] max-w-none rounded-none m-0"
                        : "h-[85vh] sm:max-w-7xl sm:rounded-xl"
                )}
            >
                {/* Header */}
                <DialogHeader className="px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
                    <div className="flex items-center justify-between mr-8"> {/* mr-8 to avoid overlap with close button */}
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                                <Braces className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-0.5 min-w-0">
                                <DialogTitle className="text-base font-semibold tracking-tight truncate">{title}</DialogTitle>
                                <DialogDescription className="sr-only">JSON Data Viewer</DialogDescription>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="font-mono text-[10px] tracking-widest uppercase rounded-sm px-1.5 py-0">JSON</Badge>
                                    <span className="truncate">{Array.isArray(data) ? `${data.length} Items` : 'Object'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden sm:flex items-center gap-1.5 mr-2 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md border border-border/40">
                                <span className="text-[10px]">Search</span>
                                <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                                    <span className="text-xs">⌘</span>F
                                </kbd>
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleDownload}>
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download JSON</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className={cn("h-8 w-8 text-muted-foreground hover:text-foreground", copied && "text-emerald-500 hover:text-emerald-600")} onClick={handleCopy}>
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy to Clipboard</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="mx-1 h-4 w-[1px] bg-border" />

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={() => setIsFullscreen(!isFullscreen)}
                                        >
                                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </DialogHeader>

                {/* Editor Content */}
                <div className="flex-1 min-h-0 bg-[#1e1e1e] dark:bg-[#1e1e1e]">
                    <Editor
                        height="100%"
                        defaultLanguage="json"
                        value={JSON.stringify(data, null, 2)}
                        theme={monacoTheme}
                        options={{
                            readOnly: true,
                            minimap: { enabled: true },
                            scrollBeyondLastLine: false,
                            fontSize: 13,
                            fontFamily: "JetBrains Mono, Menlo, Monaco, 'Courier New', monospace",
                            padding: { top: 16, bottom: 16 },
                            smoothScrolling: true,
                            cursorBlinking: "smooth",
                            formatOnPaste: true,
                            wordWrap: "on",
                            folding: true,
                            lineNumbers: "on",
                            renderLineHighlight: "all",
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
