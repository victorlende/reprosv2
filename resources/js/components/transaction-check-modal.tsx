import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, Calendar as CalendarIcon, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface TransactionCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData: any;
    onCheck: (type: string, key: string, date: string) => Promise<void>;
}

export function TransactionCheckModal({
    isOpen,
    onClose,
    initialData,
    onCheck
}: TransactionCheckModalProps) {
    const [type, setType] = useState("seconddata");
    const [searchKey, setSearchKey] = useState("");
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    // Initialize form when modal opens with new data
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setType("seconddata");
                // Check for Wseconddata (could be array or string)
                let val = "";
                if (Array.isArray(initialData.Wseconddata) && initialData.Wseconddata.length > 0) {
                    val = initialData.Wseconddata[0] || "";
                } else {
                    val = initialData.Wseconddata || initialData.seconddata || initialData.wseconddata || "";
                }

                // Fallback to txseqnum if seconddata is empty, or keep empty to let user fill
                if (!val) {
                    val = initialData.Wtxseqnum || initialData.txseqnum || initialData.wtxseqnum || "";
                    if (val) setType("txseqnum"); // Switch back if only txseqnum is found
                }

                setSearchKey(val);

                const dateStr = initialData.Wdatepost || initialData.wdatepost || initialData.Wtxdate || initialData.wtxdate;
                if (dateStr) {
                    // Try parsing 'YYYY-MM-DD' or 'YYYY-MM-DD HH:mm:ss'
                    const d = new Date(dateStr);
                    if (!isNaN(d.getTime())) {
                        setDate(d);
                    } else {
                        setDate(undefined);
                    }
                } else {
                    setDate(undefined);
                }
            } else {
                // Reset to defaults if no initial data (Header button click)
                setType("seconddata");
                setSearchKey("");
                setDate(undefined);
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !searchKey || !date) return;

        setLoading(true);
        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            await onCheck(type, searchKey, formattedDate);
            onClose(); // Close this modal on success (results shown in JSON Viewer)
        } catch (error) {
            console.error("Check failed", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] border border-border/60 shadow-none backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Cek Status Transaksi</DialogTitle>
                    <DialogDescription>
                        Konfirmasi parameter pencarian untuk pengecekan status di Core Banking.
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-6 flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
                    <Info className="h-4 w-4 shrink-0" />
                    <span>
                        Tips: Pilih <span className="font-semibold">Second Data</span> untuk pencarian menggunakan <span className="font-semibold">Kode Bayar</span>.
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4 pb-0">
                    <div className="grid gap-2">
                        <Label htmlFor="type">Search By</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger id="type" className="shadow-none border-border/50">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="txseqnum">Tx Sequence (Txseqnum)</SelectItem>
                                <SelectItem value="proccode">Proccode</SelectItem>
                                <SelectItem value="narrative">Narrative</SelectItem>
                                <SelectItem value="cardnum">Card Number</SelectItem>
                                <SelectItem value="firstdata">First Data</SelectItem>
                                <SelectItem value="seconddata">Second Data</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="key">Search Key / Value</Label>
                        <Input
                            id="key"
                            value={searchKey}
                            onChange={(e) => setSearchKey(e.target.value)}
                            className="shadow-none border-border/50"
                            placeholder="Enter value..."
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="check-modal-date">Transaction Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="check-modal-date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal shadow-none border-border/50",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: id }) : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button variant="outline" type="button" onClick={onClose} className="shadow-none border-border/50">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="shadow-none">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Checking...
                                </>
                            ) : (
                                <>
                                    <Search className="mr-2 h-4 w-4" />
                                    Cek Status
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
