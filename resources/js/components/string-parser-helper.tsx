import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Ruler, Copy } from "lucide-react";
import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function StringParserHelper() {
    const [text, setText] = useState("");
    const [selection, setSelection] = useState({ start: 0, length: 0, text: "" });
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
        const target = e.target as HTMLTextAreaElement;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const length = end - start;
        const selectedText = text.substring(start, end);

        setSelection({
            start,
            length,
            text: selectedText
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-6 text-[10px]">
                    <Ruler className="h-3 w-3 mr-1" />
                    Substring Helper
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Substring Position Calculator</DialogTitle>
                    <DialogDescription>
                        Paste string data Anda, lalu blok teks yang ingin diambil untuk melihat posisi index-nya.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <Label>Data String</Label>
                        <Textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onSelect={handleSelect}
                            placeholder="Paste fixed-width data string Anda di sini..."
                            className="font-mono text-xs h-32 whitespace-pre overflow-x-auto"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Start Index</Label>
                            <div className="flex gap-2">
                                <Input value={selection.start} readOnly className="font-mono text-center bg-muted" />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => navigator.clipboard.writeText(selection.start.toString())}
                                    title="Copy Start Index"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Length</Label>
                            <div className="flex gap-2">
                                <Input value={selection.length} readOnly className="font-mono text-center bg-muted" />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => navigator.clipboard.writeText(selection.length.toString())}
                                    title="Copy Length"
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {selection.length > 0 && (
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded text-xs">
                            <span className="font-semibold text-blue-700 dark:text-blue-300">Preview:</span>
                            <span className="font-mono ml-2 break-all">"{selection.text}"</span>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
