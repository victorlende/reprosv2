import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, FileJson, X, ChevronLeft, ChevronRight, Search, SearchX, Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { JsonSearchViewer } from "./json-search-viewer";
import { useState, useRef, useMemo } from "react";

interface TransactionResultTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: any | any[];
}

export function TransactionResultTableModal({
    isOpen,
    onClose,
    data
}: TransactionResultTableModalProps) {
    const [jsonViewerOpen, setJsonViewerOpen] = useState(false);
    const [selectedItemForJson, setSelectedItemForJson] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const viewportRef = useRef<HTMLDivElement>(null);

    // Column Visibility State
    const [columnVisibility, setColumnVisibility] = useState({
        firstData: false,
        secondData: false,
        savingData: false,
        extraData: false
    });

    const toggleColumn = (key: keyof typeof columnVisibility) => {
        setColumnVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const scrollLeft = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (viewportRef.current) {
            viewportRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    // Normalize data to array and filter out invalid/empty items
    const rawTransactions = useMemo(() => {
        const arr = Array.isArray(data) ? data : (data ? [data] : []);
        return arr.filter((item: any) => item && (item.Wisocode || item.Wresponcode));
    }, [data]);

    // Filter transactions based on search query
    const transactions = useMemo(() => {
        if (!searchQuery.trim()) return rawTransactions;
        const lowerQuery = searchQuery.toLowerCase();
        return rawTransactions.filter(item => {
            // Simple generic search across all values
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(lowerQuery)
            );
        });
    }, [rawTransactions, searchQuery]);

    const formatTime = (secondsStr: string | number) => {
        const inputSeconds = typeof secondsStr === 'string' ? parseInt(secondsStr, 10) : secondsStr;
        if (isNaN(inputSeconds)) return secondsStr;
        const hours = Math.floor(inputSeconds / 3600);
        const minutes = Math.floor((inputSeconds % 3600) / 60);
        const seconds = inputSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Helper to extract array item safely
    const getArrayItem = (arr: any, index: number) => {
        if (Array.isArray(arr) && arr.length > index) {
            return arr[index];
        }
        return '';
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[90vw] h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl border border-border/60 shadow-xl bg-background/95 backdrop-blur-xl [&>button]:hidden">
                <DialogHeader className="px-6 py-4 border-b border-border/40 bg-background/95 backdrop-blur shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <DialogTitle>Status Transaksi</DialogTitle>
                            <DialogDescription>
                                Detail respon dari Core Banking
                            </DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-muted-foreground mr-2">Show:</span>
                            <Button
                                variant={columnVisibility.firstData ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleColumn('firstData')}
                            >
                                First Data (10)
                            </Button>
                            <Button
                                variant={columnVisibility.secondData ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleColumn('secondData')}
                            >
                                Second Data (20)
                            </Button>
                            <Button
                                variant={columnVisibility.savingData ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleColumn('savingData')}
                            >
                                Saving Data
                            </Button>
                            <Button
                                variant={columnVisibility.extraData ? "secondary" : "outline"}
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => toggleColumn('extraData')}
                            >
                                Extra Info
                            </Button>
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari data transaksi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9 text-sm"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-muted/10 relative group">
                    <ScrollArea className="h-full w-full" viewportRef={viewportRef}>
                        <div className="min-w-max p-6">
                            <table className="w-full border-collapse text-xs">
                                <thead className="bg-muted/50 text-muted-foreground font-medium">
                                    <tr className="border-b border-border/50">
                                        <th className="px-3 py-2 text-left bg-muted/50 sticky left-0 z-20 border-r border-border/50">Action</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wisocode</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wresponcode</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wtermid</th>
                                        <th className="px-3 py-2 text-left min-w-[200px]">Wnarrative</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wproccode</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wtxseqnum</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wtranstime</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wdatepost</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wtransdate</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wactamount</th>

                                        {/* Wfirstdata 1-10 */}
                                        {columnVisibility.firstData && Array.from({ length: 10 }).map((_, i) => (
                                            <th key={`wfirst-${i}`} className="px-3 py-2 text-left min-w-[80px]">Wfirstdata[{i + 1}]</th>
                                        ))}

                                        {/* Wseconddata 1-20 */}
                                        {columnVisibility.secondData && Array.from({ length: 20 }).map((_, i) => (
                                            <th key={`wsecond-${i}`} className="px-3 py-2 text-left min-w-[80px]">Wseconddata[{i + 1}]</th>
                                        ))}

                                        <th className="px-3 py-2 text-left min-w-[80px]">Wtxtime</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wtxcode</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wbrnchcode</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wauthotel</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wtellid</th>
                                        <th className="px-3 py-2 text-left min-w-[80px]">Wtelseqnum</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">WRemoteAccNo</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wtoaccno</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wccycode</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wchqdate</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wmoreprint</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wreqtype</th>
                                        <th className="px-3 py-2 text-left min-w-[120px]">Wactname</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wpbbalnc / Fee</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wavlbalnc</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wtxamount</th>
                                        <th className="px-3 py-2 text-left min-w-[100px]">Wchqnumber</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wlinepb</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wstatproc</th>
                                        <th className="px-3 py-2 text-left min-w-[60px]">Wwithpassbook</th>

                                        {/* Wsavdate 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavdate-${i}`} className="px-3 py-2 text-left min-w-[100px]">Wsavdate[{i + 1}]</th>
                                        ))}
                                        {/* Wsavtxtype 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavtxtype-${i}`} className="px-3 py-2 text-left min-w-[60px]">Wsavtxtype[{i + 1}]</th>
                                        ))}
                                        {/* Wsavamount 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavamount-${i}`} className="px-3 py-2 text-left min-w-[100px]">Wsavamount[{i + 1}]</th>
                                        ))}
                                        {/* Wsavtlrid 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavtlrid-${i}`} className="px-3 py-2 text-left min-w-[80px]">Wsavtlrid[{i + 1}]</th>
                                        ))}
                                        {/* Wsavlinepb 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavlinepb-${i}`} className="px-3 py-2 text-left min-w-[60px]">Wsavlinepb[{i + 1}]</th>
                                        ))}
                                        {/* Wsavpbbal 1-5 */}
                                        {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                            <th key={`wsavpbbal-${i}`} className="px-3 py-2 text-left min-w-[100px]">Wsavpbbal[{i + 1}]</th>
                                        ))}

                                        {columnVisibility.extraData && (
                                            <>
                                                <th className="px-3 py-2 text-left min-w-[80px]">av$WextcharA[1]</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">av$WextcharA[2]</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">WextcharB[1]</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">WextcharB[2]</th>

                                                <th className="px-3 py-2 text-left min-w-[80px]">Wprodtype</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wsendfile</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wsubtype</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wsendbranch</th>
                                                <th className="px-3 py-2 text-left min-w-[120px]">Wcardnum</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wisbcode</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wdebcode</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wacbcode</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wproductid</th>
                                                <th className="px-3 py-2 text-left min-w-[80px]">Wfrombranch</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-background">
                                    {transactions.map((item, idx) => (
                                        <tr key={idx} className="border-b border-border/40 hover:bg-muted/30">
                                            <td className="px-3 py-2 bg-background sticky left-0 z-20 border-r border-border/50">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        setSelectedItemForJson(item);
                                                        setJsonViewerOpen(true);
                                                    }}
                                                >
                                                    <FileJson className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                            </td>
                                            <td className="px-3 py-2">{item.Wisocode}</td>
                                            <td
                                                className="px-3 py-2 font-medium"
                                                style={{
                                                    backgroundColor: (item.Wresponcode === '00' || item.Wresponcode === '88') ? '#D1E7DD' : '#ffc7ca',
                                                    color: '#1f2937'
                                                }}
                                            >
                                                {item.Wresponcode}
                                            </td>
                                            <td className="px-3 py-2">{item.Wtermid}</td>
                                            <td className="px-3 py-2">{item.Wnarrative}</td>
                                            <td className="px-3 py-2">{item.Wproccode}</td>
                                            <td className="px-3 py-2">{item.Wtxseqnum}</td>
                                            <td className="px-3 py-2 font-mono">{formatTime(item.Wtranstime)}</td>
                                            <td className="px-3 py-2">{item.Wdatepost}</td>
                                            <td className="px-3 py-2">{item.Wtransdate}</td>
                                            <td className="px-3 py-2">{item.Wactamount}</td>

                                            {/* Wfirstdata 1-10 */}
                                            {columnVisibility.firstData && Array.from({ length: 10 }).map((_, i) => (
                                                <td key={`wfirst-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wfirstdata, i)}</td>
                                            ))}

                                            {/* Wseconddata 1-20 */}
                                            {columnVisibility.secondData && Array.from({ length: 20 }).map((_, i) => (
                                                <td key={`wsecond-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wseconddata, i)}</td>
                                            ))}

                                            <td className="px-3 py-2">{item.Wtxtime}</td>
                                            <td className="px-3 py-2">{item.Wtxcode}</td>
                                            <td className="px-3 py-2">{item.Wbrnchcode}</td>
                                            <td className="px-3 py-2">{item.Wauthotel}</td>
                                            <td className="px-3 py-2">{item.Wtellid}</td>
                                            <td className="px-3 py-2">{item.Wtelseqnum}</td>
                                            <td className="px-3 py-2">{item.WRemoteAccNo}</td>
                                            <td className="px-3 py-2">{item.Wtoaccno}</td>
                                            <td className="px-3 py-2">{item.Wccycode}</td>
                                            <td className="px-3 py-2">{item.Wchqdate}</td>
                                            <td className="px-3 py-2">{item.Wmoreprint}</td>
                                            <td className="px-3 py-2">{item.Wreqtype}</td>
                                            <td className="px-3 py-2">{item.Wactname}</td>
                                            <td className="px-3 py-2">{item.Wpbbalnc}</td>
                                            <td className="px-3 py-2">{item.Wavlbalnc}</td>
                                            <td className="px-3 py-2">{item.Wtxamount}</td>
                                            <td className="px-3 py-2">{item.Wchqnumber}</td>
                                            <td className="px-3 py-2">{item.Wlinepb}</td>
                                            <td className="px-3 py-2">{item.Wstatproc}</td>
                                            <td className="px-3 py-2">{item.Wwithpassbook}</td>

                                            {/* Wsav* Arrays */}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavdate-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavdate, i)}</td>
                                            ))}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavtxtype-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavtxtype, i)}</td>
                                            ))}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavamount-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavamount, i)}</td>
                                            ))}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavtlrid-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavtlrid, i)}</td>
                                            ))}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavlinepb-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavlinepb, i)}</td>
                                            ))}
                                            {columnVisibility.savingData && Array.from({ length: 5 }).map((_, i) => (
                                                <td key={`wsavpbbal-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavpbbal, i)}</td>
                                            ))}

                                            {columnVisibility.extraData && (
                                                <>
                                                    <td className="px-3 py-2">{getArrayItem(item.avWextcharA, 0)}</td>
                                                    <td className="px-3 py-2">{getArrayItem(item.avWextcharA, 1)}</td>
                                                    <td className="px-3 py-2">{getArrayItem(item.avWextcharB, 0)}</td>
                                                    <td className="px-3 py-2">{getArrayItem(item.avWextcharB, 1)}</td>

                                                    <td className="px-3 py-2">{item.Wprodtype}</td>
                                                    <td className="px-3 py-2">{item.Wsendfile}</td>
                                                    <td className="px-3 py-2">{item.Wsubtype}</td>
                                                    <td className="px-3 py-2">{item.Wsendbranch}</td>
                                                    <td className="px-3 py-2">{item.Wcardnum}</td>
                                                    <td className="px-3 py-2">{item.Wisbcode}</td>
                                                    <td className="px-3 py-2">{item.Wdebcode}</td>
                                                    <td className="px-3 py-2">{item.Wacbcode}</td>
                                                    <td className="px-3 py-2">{item.Wproductid}</td>
                                                    <td className="px-3 py-2">{item.Wfrombranch}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    {transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={100} className="px-3 py-12 text-left text-muted-foreground bg-background">
                                                <div className="flex justify-start items-center w-full px-6">
                                                    <div className="max-w-md">
                                                        <div className="border-2 border-dashed border-border/60 rounded-xl p-8 bg-muted/5">
                                                            <div className="flex flex-col items-center justify-center gap-2 mb-6 text-center">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50 p-3 text-muted-foreground mb-4">
                                                                    <Cloud className="h-6 w-6 opacity-50" />
                                                                </div>
                                                                <h3 className="text-xl font-semibold tracking-tight text-foreground">
                                                                    {searchQuery ? "Data Tidak Ditemukan" : "Belum Ada Transaksi"}
                                                                </h3>
                                                                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                                                    {searchQuery
                                                                        ? `Tidak ada hasil yang cocok dengan kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                                                                        : "Belum ada data transaksi yang tersedia untuk ditampilkan saat ini."}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>

                    {/* Left/Right Scroll Buttons */}
                    <div className="absolute bottom-6 right-6 flex gap-2 z-30">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-[10px] shadow-lg border border-border/50 bg-background/95 backdrop-blur hover:bg-muted"
                            onClick={scrollLeft}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-[10px] shadow-lg border border-border/50 bg-background/95 backdrop-blur hover:bg-muted"
                            onClick={scrollRight}
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </DialogContent>

            {/* Nested JSON Viewer */}
            <JsonSearchViewer
                data={selectedItemForJson}
                title="Single Transaction JSON"
                open={jsonViewerOpen}
                onOpenChange={setJsonViewerOpen}
            />
        </Dialog>
    );
}
