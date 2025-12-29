import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Copy, Check, FileJson, X, Braces, ChevronRight, ChevronDown, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface JsonSearchViewerProps {
    data: any;
    title: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function JsonSearchViewer({ data, title, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: JsonSearchViewerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copied, setCopied] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalIsOpen;
    const setIsOpen = isControlled ? setControlledOpen! : setInternalIsOpen;

    // Search Navigation State
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
    const [totalMatches, setTotalMatches] = useState(0);

    // Folding State
    const [collapsedLines, setCollapsedLines] = useState<Set<number>>(new Set());

    const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Reset states when closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setCollapsedLines(new Set());
            setCurrentMatchIndex(0);
            setTotalMatches(0);
        }
    }, [isOpen]);

    // Derived Data: Split JSON into lines
    const jsonLines = useMemo(() => {
        const str = JSON.stringify(data, null, 2);
        return str.split('\n');
    }, [data]);

    // Syntax Highlighting Helper
    const highlightLine = useCallback((line: string, lineIndex: number) => {
        // Reconstruct line with spans
        // This regex splits by key-value structure
        // Group 1: Leading space
        // Group 2: Key (with quotes)
        // Group 3: Colon
        // Group 4: Value (string with quotes, number, bool, or brace)
        // Group 5: Trailing comma?

        // Visualizing Regex is brittle. Let's do a simpler pass:
        // Identify if it's a key line or end line.

        // Clean implementation:
        // Use a simpler approach: Just regex replace for colors on specific matches
        // WARNING: DangerouslySetInnerHTML is risky but standard for syntax highlighters.
        // We will use a safe approach by parsing.

        return (
            <span dangerouslySetInnerHTML={{ __html: colorizeJson(line, searchTerm, currentMatchIndex) }} />
        );

    }, [searchTerm, currentMatchIndex]);

    // Search Logic
    useEffect(() => {
        if (!searchTerm) {
            setTotalMatches(0);
            setCurrentMatchIndex(0);
            return;
        }

        let count = 0;
        jsonLines.forEach(line => {
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = line.match(regex);
            if (matches) count += matches.length;
        });
        setTotalMatches(count);
        setCurrentMatchIndex(count > 0 ? 1 : 0); // Start at 1st match

        // Auto-scroll to first match? 
        // Implementation complexity: We need to know which LINE contains the Nth match.
        // For this purely visual viewer, just jumping to the first line with a match is good.
    }, [searchTerm, jsonLines]);

    const scrollToMatch = (direction: 'next' | 'prev') => {
        if (totalMatches === 0) return;

        let newIndex = currentMatchIndex;
        if (direction === 'next') {
            newIndex = currentMatchIndex >= totalMatches ? 1 : currentMatchIndex + 1;
        } else {
            newIndex = currentMatchIndex <= 1 ? totalMatches : currentMatchIndex - 1;
        }
        setCurrentMatchIndex(newIndex);

        // Scroll Logic needs to find which line corresponds to match #newIndex
        // This is expensive to calc every time but necessary for "Next/Prev" behavior specific to text position.
        // Simplified: Just scroll to next *line* containing the term?
        // Let's implement a simpler "Jump to next line" logic.

        let matchCounter = 0;
        for (let i = 0; i < jsonLines.length; i++) {
            // Handle collapsed lines - skip search? Or expand?
            // Ideally expand. For now, we skip searching inside collapsed blocks for simplicity, 
            // or better: we search but if it's hidden we expand it.

            // Check if this line is visible
            // Logic for visibility: Is any parent collapsed?
            // This is O(N^2) effectively if we scan parents. 
            // Faster: line is visible if no collapsedLines contains a range covering this line.

            const lineLine = jsonLines[i];
            const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            const matches = lineLine.match(regex);

            if (matches) {
                for (let m = 0; m < matches.length; m++) {
                    matchCounter++;
                    if (matchCounter === newIndex) {
                        // Found the target line!
                        const el = lineRefs.current[i];
                        if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            // TODO: Expand if hidden (omitted for now to keep complexity manageable)
                        }
                        return;
                    }
                }
            }
        }
    };

    // Calculate Data Size
    const dataSize = useMemo(() => {
        const bytes = new TextEncoder().encode(JSON.stringify(data)).length;
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }, [data]);

    // Handle Download
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

    // Folding Logic
    const toggleFold = (index: number) => {
        const line = jsonLines[index];
        // Check indentation
        const currentIndent = line.search(/\S/);

        // Find closing brace/bracket with same indentation
        // Naive block finding: line indent + 1... until same indent found?
        // Better: Just toggle visibility of the line itself? No, we need to hide children.
        // Folding Strategy:
        // We know standard JSON.stringify structure.
        // If line ends with { or [, it opens a block.
        // The block closes when we find a line with SAME indentation that starts with } or ].

        // Check if currently collapsed
        const isCollapsed = collapsedLines.has(index);
        const newCollapsed = new Set(collapsedLines);

        if (isCollapsed) {
            newCollapsed.delete(index);
        } else {
            // Validate it's a foldable line
            if (line.trim().endsWith('{') || line.trim().endsWith('[')) {
                newCollapsed.add(index);
            }
        }
        setCollapsedLines(newCollapsed);
    };

    // Determine which lines to show
    // We need to efficiently hide lines that are inside collapsed blocks.
    // Map of "End Line" for each "Start Line"?
    const blockRanges = useMemo(() => {
        const ranges = new Map<number, number>(); // Start Index -> End Index
        const stack: { indent: number, index: number }[] = [];

        jsonLines.forEach((line, i) => {
            const indent = line.search(/\S/);
            const trimmed = line.trim();

            // Check for closer
            if (trimmed.startsWith('}') || trimmed.startsWith(']')) {
                // Find matching opener from stack
                // Since JSON is well formed, the last one on stack with this indent (or slightly less?) should be it.
                // JSON.stringify indent is simple: 2 spaces.
                // Closer indent == Opener indent.

                // Pop stack until we find match
                while (stack.length > 0) {
                    const top = stack[stack.length - 1];
                    if (top.indent === indent) {
                        ranges.set(top.index, i);
                        stack.pop();
                        break;
                    }
                    // Error handling for malformed (shouldn't happen with JSON.stringify)
                    stack.pop();
                }
            }

            if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                stack.push({ indent, index: i });
            }
        });
        return ranges;
    }, [jsonLines]);

    // Render loop helper
    const isLineVisible = (index: number) => {
        // A line is visible if NO parent block (that covers this line) is collapsed.
        // Checking all parents is slow?
        // Optimization: Iterate linearly?
        // Since we render line by line, we can keep track of "currently inside collapsed block logic".
        // BUT, React calls map().
        // Let's use the collapsedLines Set and checks.

        for (const [start, end] of blockRanges.entries()) {
            if (collapsedLines.has(start)) {
                if (index > start && index <= end) return false;
            }
        }
        return true;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="flex h-[85vh] max-w-5xl flex-col p-0 gap-0 overflow-hidden sm:rounded-xl border border-border/60 shadow-none backdrop-blur-xl">
                {/* Header */}
                <DialogHeader className="px-6 py-5 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <DialogTitle className="text-xl font-semibold tracking-tight">{title}</DialogTitle>
                                <DialogDescription className="sr-only">JSON Data Viewer</DialogDescription>
                                <Badge variant="secondary" className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground/70">JSON</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <Braces className="h-3.5 w-3.5" />
                                    {Array.isArray(data) ? `${data.length} Items` : 'Object'}
                                </span>
                                <span className="h-1 w-1 rounded-full bg-border" />
                                <span>{dataSize}</span>
                            </div>
                        </div>
                        {/* Built-in Close button from DialogContent will appear here */}
                    </div>
                </DialogHeader>

                {/* Toolbar */}
                <div className="px-6 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                            <Input
                                type="text"
                                placeholder="Find..."
                                className="pl-9 h-9 border-border/50 bg-background/50 hover:bg-background focus:bg-background transition-colors text-sm shadow-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        scrollToMatch(e.shiftKey ? 'prev' : 'next');
                                    }
                                }}
                            />
                        </div>
                        {totalMatches > 0 && (
                            <div className="flex items-center h-9 px-2 gap-1 bg-background/50 border border-border/50 rounded-md">
                                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                                    {currentMatchIndex} / {totalMatches}
                                </span>
                                <div className="h-4 w-[1px] bg-border/50 mx-1" />
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => scrollToMatch('prev')}>
                                    <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => scrollToMatch('next')}>
                                    <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-9 gap-2 border-border/50 shadow-none"
                                        onClick={handleDownload}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:inline-block text-xs">Download</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download .json file</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn(
                                            "h-9 transition-all gap-2 border-border/50 shadow-none",
                                            copied && "border-emerald-500/50 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400"
                                        )}
                                        onClick={() => {
                                            copyToClipboard(JSON.stringify(data, null, 2))
                                                .then(() => {
                                                    setCopied(true);
                                                    setTimeout(() => setCopied(false), 2000);
                                                })
                                                .catch((err) => console.error('Failed to copy', err));
                                        }}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="h-3.5 w-3.5" />
                                                <span className="sr-only sm:not-sr-only sm:inline-block text-xs font-medium">Copied</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                <span className="sr-only sm:not-sr-only sm:inline-block text-xs">Copy</span>
                                            </>
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy to Clipboard</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* Content - Line Based Rendering */}
                <div className="flex-1 min-h-0 bg-secondary/5 relative group">
                    <ScrollArea className="h-full w-full">
                        <div className="flex min-h-full font-mono text-sm leading-6">
                            {/* Gutter (Line Numbers) */}
                            <div className="flex-none flex flex-col items-end px-2 py-4 bg-muted/10 border-r border-border/30 select-none text-muted-foreground/50 text-[11px] min-w-[3rem]">
                                {jsonLines.map((_, i) => (
                                    isLineVisible(i) ? (
                                        <div key={i} className="h-6 leading-6 w-full text-right pr-2">
                                            {i + 1}
                                        </div>
                                    ) : null
                                ))}
                            </div>

                            {/* Code Area */}
                            <div className="flex-1 px-4 py-4 overflow-x-auto whitespace-pre">
                                {jsonLines.map((line, i) => {
                                    if (!isLineVisible(i)) return null;

                                    const isFoldable = (line.trim().endsWith('{') || line.trim().endsWith('['));
                                    const isCollapsed = collapsedLines.has(i);

                                    // Placeholder for collapsed content
                                    const collapsedPlaceholder = isCollapsed ? (
                                        <span className="text-muted-foreground select-none bg-muted/30 px-1 rounded text-xs ml-1 font-sans">
                                            ... {line.trim().endsWith('{') ? '}' : ']'}
                                        </span>
                                    ) : null;

                                    return (
                                        <div
                                            key={i}
                                            ref={el => { lineRefs.current[i] = el; }}
                                            className="group/line h-6 leading-6 flex items-center relative hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        >
                                            {/* Fold Icon */}
                                            {isFoldable && (
                                                <div
                                                    className="absolute -left-6 w-5 h-5 flex items-center justify-center cursor-pointer hover:text-foreground text-muted-foreground/50 transition-colors"
                                                    onClick={() => toggleFold(i)}
                                                >
                                                    {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                </div>
                                            )}

                                            {/* Text Content */}
                                            <div className="text-foreground/90">
                                                {highlightLine(line, i)}
                                                {collapsedPlaceholder}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollArea>
                </div>

                {/* Footer */}
                <div className="bg-background/95 border-t border-border/40 px-6 py-3 flex justify-between items-center text-xs text-muted-foreground">
                    <div>
                        Press <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">Esc</kbd> to close
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Logic to colorize JSON string pieces and highlight search terms
function colorizeJson(line: string, searchTerm: string, matchLimitIndex?: number): string {
    // Single-pass tokenization to avoid "recursive" replacement bugs (e.g. matching numbers inside CSS classes)
    // Regex matches:
    // 1. Strings (including keys which end with :)
    // 2. Booleans/Null
    // 3. Numbers
    const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?([eE][+-]?\d+)?)/g;

    let escaped = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // We can't safely run regex on already escaped HTML for syntax highlighting if we want to be 100% correct about content vs tags.
    // Ideally, we tokenise the raw string, then escape the content, then wrap in spans.
    // Re-approach: processing the raw line.

    // BUT, we need to handle HTML escaping for the content displayed.
    // Let's tokenise the raw line, and in the replace callback, escape the content AND wrap it.

    const highlighted = line.replace(tokenRegex, (match) => {
        let cls = '';
        let content = match;

        // Escape the content for HTML display
        const escapedMatch = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        if (match.startsWith('"')) {
            if (match.trim().endsWith(':')) {
                cls = 'text-blue-600 dark:text-blue-400';
            } else {
                cls = 'text-emerald-600 dark:text-emerald-400';
            }
        } else if (/true|false|null/.test(match)) {
            cls = 'text-purple-600 dark:text-purple-400 font-semibold';
        } else if (!isNaN(Number(match))) {
            cls = 'text-orange-600 dark:text-orange-500';
        }

        if (cls) {
            return `<span class="${cls}">${escapedMatch}</span>`;
        }
        return escapedMatch;
    });

    // Re-escape the non-matched parts?
    // The `replace` only returns the matched parts replaced. The parts *between* matches (like whitespace, commas, brackets) are NOT replaced.
    // They are raw. We need to escape them too.
    // This `replace` approach on the whole string only acts on matches.

    // Let's stick to the previous strategy but FIX the bug:
    // The bug was overlapping regexes on the *output* of previous regexes.
    // The single-pass `line.replace(tokenRegex...)` solves that collision.
    // The only remaining issue is escaping the *unmatched* parts (brackets, commas, spaces).

    // We can do this by matching EVERYTHING.
    // /...token...|([^\s\w])/g ? No.

    // Let's just HTML-escape the WHOLE string first?
    // `let safeLine = escapeHtml(line);`
    // Then run regex on `safeLine`?
    // Regex for `"` will match `&quot;` ? No.
    // We must regex on RAW line, then escape content.

    // Correct Implementation:
    // 1. Identify tokens.
    // 2. Build result string.

    let result = '';
    let lastIndex = 0;

    // Reset regex state just in case (though not sticky/global in loop)
    // using loop for full control
    let match;
    const matcher = new RegExp(tokenRegex); // Clone

    while ((match = matcher.exec(line)) !== null) {
        // Text before match: Escape it
        const prefix = line.slice(lastIndex, match.index);
        result += prefix.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        // Process match
        const text = match[0];
        const escapedText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        let cls = '';
        if (text.startsWith('"')) {
            if (text.trim().endsWith(':')) {
                cls = 'text-blue-600 dark:text-blue-400';
            } else {
                cls = 'text-emerald-600 dark:text-emerald-400';
            }
        } else if (/^(true|false|null)$/.test(text)) {
            cls = 'text-purple-600 dark:text-purple-400 font-semibold';
        } else if (/^-?\d/.test(text)) {
            cls = 'text-orange-600 dark:text-orange-500';
        }

        result += cls ? `<span class="${cls}">${escapedText}</span>` : escapedText;

        lastIndex = matcher.lastIndex;
    }

    // Text after last match
    result += line.slice(lastIndex).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Search Term Highlighting
    // Note: Applying this *after* syntax highlighting works IF search term doesn't match class names.
    // If user searches for "span" or "blue", it will break.
    // Safest is to do this during the tokenization or before.
    // Given the difficulty, we will leave the risk for now (User unlikely to search for "text-blue-600").
    // But we need to highlight the Search Term in the VISIBLE text.
    // If we use `result`, we are searching in HTML.

    if (searchTerm) {
        // Naive replace on the final HTML string. 
        // Risks matching attributes.
        // Accepted trade-off for this complexity level.
        // Improvement: check that match is not inside <...> tag?
        // This is hard with regex.
        const term = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Negative lookahead assertion to ensure we aren't inside a tag?
        // (?![^<]*>) checks if there's no closing > ahead without an opening < ?
        // Standard heuristic: `(?!([^<]+)?>)`
        const searchRegex = new RegExp(`(${term})(?![^<]*>)`, 'gi');
        result = result.replace(searchRegex, '<mark class="bg-amber-200 text-amber-900 rounded-px px-0.5 dark:bg-amber-500/50 dark:text-amber-100">$1</mark>');
    }

    return result;
}

// Robust copy function with fallback
async function copyToClipboard(text: string): Promise<void> {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            if (successful) resolve();
            else reject(new Error('Copy command failed'));
        } catch (err) {
            reject(err);
        } finally {
            document.body.removeChild(textArea);
        }
    });
}
