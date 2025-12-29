import React, { useState, useMemo, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react'; // Correct import for Head
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Calendar as CalendarIcon, Info, FileJson, ChevronLeft, ChevronRight, Cloud } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { JsonSearchViewer } from '@/components/json-search-viewer';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rekon FTR - PSW',
        href: '/rekonsiliasi',
    },
    {
        title: 'Monitor PSW to T24',
        href: '/rekonsiliasi/monitor-psw-t24',
    },
];

export default function MonitorPswToT24() {
    // Form State
    const [type, setType] = useState("seconddata");
    const [searchKey, setSearchKey] = useState("");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(false);

    // Result State
    const [resultData, setResultData] = useState<any>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Table View State
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

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!type || !searchKey || !date) return;

        setLoading(true);
        setResultData(null);
        setHasSearched(true);

        try {
            const formattedDate = format(date, "yyyy-MM-dd");
            const res = await window.axios.post('/rekonsiliasi/check-status', {
                type,
                key: searchKey,
                date: formattedDate
            });
            setResultData(res.data);
        } catch (error: any) {
            console.error("Check failed", error);
            if (error.response && error.response.data) {
                setResultData(error.response.data);
            } else {
                setResultData({
                    success: false,
                    message: error.message || "Unknown error occurred"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for Table
    const formatTime = (secondsStr: string | number) => {
        const inputSeconds = typeof secondsStr === 'string' ? parseInt(secondsStr, 10) : secondsStr;
        if (isNaN(inputSeconds)) return secondsStr;
        const hours = Math.floor(inputSeconds / 3600);
        const minutes = Math.floor((inputSeconds % 3600) / 60);
        const seconds = inputSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const getArrayItem = (arr: any, index: number) => {
        if (Array.isArray(arr) && arr.length > index) {
            return arr[index];
        }
        return '';
    };

    const rawTransactions = useMemo(() => {
        if (!resultData) return [];
        // The API structure usually returns { success: boolean, data: { ... }, message: ... } 
        // OR sometimes directly the data if it was an error response body?
        // Based on previous code, let's assume resultData ITSELF might be the item, or resultData.data

        // Actually, looking at `RekonsiliasiBankController`, `result` is passed directly.
        // And `ApiService` returns the JSON response.
        // Let's handle both array and object.

        const dataToProcess = resultData.data || resultData;
        const arr = Array.isArray(dataToProcess) ? dataToProcess : (dataToProcess ? [dataToProcess] : []);

        // Filter out items that are just status/messages if mixed, but usually it's structural
        // Let's filter for items that look like transactions
        return arr.filter((item: any) => item && (item.Wisocode || item.Wresponcode));
    }, [resultData]);

    const transactions = useMemo(() => {
        if (!searchQuery.trim()) return rawTransactions;
        const lowerQuery = searchQuery.toLowerCase();
        return rawTransactions.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(lowerQuery)
            );
        });
    }, [rawTransactions, searchQuery]);


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Monitor PSW to T24" />
            <div className="flex bg-muted/10 h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Monitor PSW to T24</h1>
                    <p className="text-muted-foreground">Cek status transaksi Nominative</p>
                </div>

                <Card className="max-w-4xl border-border/60 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Parameter Pencarian</CardTitle>
                        <CardDescription>
                            Masukkan parameter kunci untuk mencari data transaksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                        <div className="mb-6 flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-300">
                            <Info className="h-4 w-4 shrink-0" />
                            <span>
                                Tips: Pilih <span className="font-semibold">Second Data</span> untuk pencarian menggunakan <span className="font-semibold">Kode Bayar</span>.
                            </span>
                        </div>

                        <form onSubmit={handleCheck} className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="grid gap-2 w-full lg:w-[200px] shrink-0">
                                <Label htmlFor="type">Search By</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger id="type" className="bg-background shadow-none">
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

                            <div className="grid gap-2 w-full lg:flex-1">
                                <Label htmlFor="key">Search Key / Value</Label>
                                <Input
                                    id="key"
                                    value={searchKey}
                                    onChange={(e) => setSearchKey(e.target.value)}
                                    placeholder="Enter value..."
                                    className="bg-background shadow-none"
                                    required
                                />
                            </div>

                            <div className="grid gap-2 w-full lg:w-[200px] shrink-0">
                                <Label htmlFor="date">Transaction Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="date"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background shadow-none",
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

                            <div className="w-full lg:w-[150px] shrink-0">
                                <Button type="submit" disabled={loading} size="lg" className="w-full shadow-none">
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
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {hasSearched && (
                    <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-border/60 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle className="text-base">Hasil Pencarian</CardTitle>
                                        <CardDescription>
                                            Menampilkan data transaksi yang ditemukan.
                                        </CardDescription>
                                    </div>
                                    <div className="relative w-full sm:w-auto min-w-[250px]">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Filter hasil..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-9 h-9 text-sm bg-background/80 shadow-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center mt-4">
                                    <span className="text-xs text-muted-foreground mr-2 font-medium">Columns:</span>
                                    <Button
                                        variant={columnVisibility.firstData ? "secondary" : "outline"}
                                        size="sm"
                                        className="h-8 text-xs bg-background shadow-none"
                                        onClick={() => toggleColumn('firstData')}
                                    >
                                        First Data
                                    </Button>
                                    <Button
                                        variant={columnVisibility.secondData ? "secondary" : "outline"}
                                        size="sm"
                                        className="h-8 text-xs bg-background shadow-none"
                                        onClick={() => toggleColumn('secondData')}
                                    >
                                        Second Data
                                    </Button>
                                    <Button
                                        variant={columnVisibility.savingData ? "secondary" : "outline"}
                                        size="sm"
                                        className="h-8 text-xs bg-background shadow-none"
                                        onClick={() => toggleColumn('savingData')}
                                    >
                                        Saving Data
                                    </Button>
                                    <Button
                                        variant={columnVisibility.extraData ? "secondary" : "outline"}
                                        size="sm"
                                        className="h-8 text-xs bg-background shadow-none"
                                        onClick={() => toggleColumn('extraData')}
                                    >
                                        Extra Info
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl border border-border/60 shadow-none bg-background overflow-hidden relative group">
                                    <ScrollArea className="w-full whitespace-nowrap" viewportRef={viewportRef}>
                                        <div className="min-w-full">
                                            <table className="w-full border-collapse text-xs">
                                                <thead className="bg-muted/40 text-muted-foreground font-medium">
                                                    <tr className="border-b border-border/50">
                                                        <th className="px-3 py-3 text-left bg-muted/40 sticky left-0 z-20 border-r border-border/50">Details</th>
                                                        <th className="px-3 py-3 text-left">Wisocode</th>
                                                        <th className="px-3 py-3 text-left">Wresponcode</th>
                                                        <th className="px-3 py-3 text-left">Wtermid</th>
                                                        <th className="px-3 py-3 text-left min-w-[150px]">Wnarrative</th>
                                                        <th className="px-3 py-3 text-left">Wproccode</th>
                                                        <th className="px-3 py-3 text-left">Wtxseqnum</th>
                                                        <th className="px-3 py-3 text-left font-mono">Wtranstime</th>
                                                        <th className="px-3 py-3 text-left">Wdatepost</th>
                                                        <th className="px-3 py-3 text-left">Wtransdate</th>
                                                        <th className="px-3 py-3 text-left">Wactamount</th>

                                                        {columnVisibility.firstData && Array.from({ length: 10 }).map((_, i) => (
                                                            <th key={`wfirst-${i}`} className="px-3 py-3 text-left text-muted-foreground/70">Wfirst[{i + 1}]</th>
                                                        ))}

                                                        {columnVisibility.secondData && Array.from({ length: 20 }).map((_, i) => (
                                                            <th key={`wsecond-${i}`} className="px-3 py-3 text-left text-muted-foreground/70">Wsecond[{i + 1}]</th>
                                                        ))}

                                                        <th className="px-3 py-3 text-left">Wtxtime</th>
                                                        <th className="px-3 py-3 text-left">Wtxcode</th>
                                                        <th className="px-3 py-3 text-left">Wbrnchcode</th>
                                                        <th className="px-3 py-3 text-left">Wauthotel</th>
                                                        <th className="px-3 py-3 text-left">Wtellid</th>
                                                        <th className="px-3 py-3 text-left">Wtelseqnum</th>
                                                        {/* <th className="px-3 py-3 text-left">WRemoteAccNo</th> */}
                                                        <th className="px-3 py-3 text-left">Wtoaccno</th>
                                                        {/* <th className="px-3 py-3 text-left">Wccycode</th> */}
                                                        {/* <th className="px-3 py-3 text-left">Wchqdate</th> */}
                                                        {/* <th className="px-3 py-3 text-left">Wmoreprint</th> */}
                                                        {/* <th className="px-3 py-3 text-left">Wreqtype</th> */}
                                                        <th className="px-3 py-3 text-left min-w-[120px]">Wactname</th>

                                                        {columnVisibility.savingData && (
                                                            <>
                                                                <th className="px-3 py-3 text-left">Wpbbalnc</th>
                                                                <th className="px-3 py-3 text-left">Wavlbalnc</th>
                                                                <th className="px-3 py-3 text-left">Wtxamount</th>
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <th key={`wsavdate-${i}`} className="px-3 py-3 text-left">Wsavdate[{i + 1}]</th>
                                                                ))}
                                                                {Array.from({ length: 5 }).map((_, i) => (
                                                                    <th key={`wsavamount-${i}`} className="px-3 py-3 text-left">Wsavamount[{i + 1}]</th>
                                                                ))}
                                                            </>
                                                        )}

                                                        {columnVisibility.extraData && (
                                                            <>
                                                                <th className="px-3 py-3 text-left">Wprodtype</th>
                                                                <th className="px-3 py-3 text-left">Wsendbranch</th>
                                                                <th className="px-3 py-3 text-left">Wcardnum</th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-background">
                                                    {transactions.length > 0 ? (
                                                        transactions.map((item, idx) => (
                                                            <tr key={idx} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                                                                <td className="px-3 py-2 bg-background sticky left-0 z-20 border-r border-border/50 group-hover:bg-muted/40 transition-colors">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                                                        onClick={() => {
                                                                            setSelectedItemForJson(item);
                                                                            setJsonViewerOpen(true);
                                                                        }}
                                                                    >
                                                                        <FileJson className="h-4 w-4" />
                                                                    </Button>
                                                                </td>
                                                                <td className="px-3 py-2">{item.Wisocode}</td>
                                                                <td className="px-3 py-2">
                                                                    <span className={cn(
                                                                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                                                                        (item.Wresponcode === '00' || item.Wresponcode === '88')
                                                                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                                            : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                                                                    )}>
                                                                        {item.Wresponcode}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2">{item.Wtermid}</td>
                                                                <td className="px-3 py-2">{item.Wnarrative}</td>
                                                                <td className="px-3 py-2">{item.Wproccode}</td>
                                                                <td className="px-3 py-2">{item.Wtxseqnum}</td>
                                                                <td className="px-3 py-2 font-mono text-muted-foreground">{formatTime(item.Wtranstime)}</td>
                                                                <td className="px-3 py-2">{item.Wdatepost}</td>
                                                                <td className="px-3 py-2">{item.Wtransdate}</td>
                                                                <td className="px-3 py-2">{item.Wactamount}</td>

                                                                {columnVisibility.firstData && Array.from({ length: 10 }).map((_, i) => (
                                                                    <td key={`wfirst-val-${i}`} className="px-3 py-2 font-mono text-muted-foreground/80">{getArrayItem(item.Wfirstdata, i)}</td>
                                                                ))}

                                                                {columnVisibility.secondData && Array.from({ length: 20 }).map((_, i) => (
                                                                    <td key={`wsecond-val-${i}`} className="px-3 py-2 font-mono text-muted-foreground/80">{getArrayItem(item.Wseconddata, i)}</td>
                                                                ))}

                                                                <td className="px-3 py-2">{item.Wtxtime}</td>
                                                                <td className="px-3 py-2">{item.Wtxcode}</td>
                                                                <td className="px-3 py-2">{item.Wbrnchcode}</td>
                                                                <td className="px-3 py-2">{item.Wauthotel}</td>
                                                                <td className="px-3 py-2">{item.Wtellid}</td>
                                                                <td className="px-3 py-2">{item.Wtelseqnum}</td>
                                                                {/* <td className="px-3 py-2">{item.WRemoteAccNo}</td> */}
                                                                <td className="px-3 py-2">{item.Wtoaccno}</td>
                                                                {/* <td className="px-3 py-2">{item.Wccycode}</td> */}
                                                                {/* <td className="px-3 py-2">{item.Wchqdate}</td> */}
                                                                {/* <td className="px-3 py-2">{item.Wmoreprint}</td> */}
                                                                {/* <td className="px-3 py-2">{item.Wreqtype}</td> */}
                                                                <td className="px-3 py-2">{item.Wactname}</td>

                                                                {columnVisibility.savingData && (
                                                                    <>
                                                                        <td className="px-3 py-2">{item.Wpbbalnc}</td>
                                                                        <td className="px-3 py-2">{item.Wavlbalnc}</td>
                                                                        <td className="px-3 py-2">{item.Wtxamount}</td>
                                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                                            <td key={`wsavdate-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavdate, i)}</td>
                                                                        ))}
                                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                                            <td key={`wsavamount-val-${i}`} className="px-3 py-2">{getArrayItem(item.Wsavamount, i)}</td>
                                                                        ))}
                                                                    </>
                                                                )}

                                                                {columnVisibility.extraData && (
                                                                    <>
                                                                        <td className="px-3 py-2">{item.Wprodtype}</td>
                                                                        <td className="px-3 py-2">{item.Wsendbranch}</td>
                                                                        <td className="px-3 py-2">{item.Wcardnum}</td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={100} className="px-3 py-16 text-center text-muted-foreground bg-muted/5">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/30 p-2 text-muted-foreground mb-2">
                                                                        <Cloud className="h-6 w-6 opacity-40" />
                                                                    </div>
                                                                    <h3 className="text-lg font-medium tracking-tight text-foreground">
                                                                        {searchQuery ? "Data Tidak Ditemukan" : "Tidak Ada Data"}
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                                                        {searchQuery
                                                                            ? `Pencarian "${searchQuery}" tidak menghasilkan data apapun.`
                                                                            : (resultData ? "Respon dari server kosong atau tidak memiliki data transaksi." : "Mulai pencarian untuk melihat data.")}
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>

                                    {/* Floating Scroll Buttons */}
                                    <div className="absolute bottom-6 right-6 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-xl shadow-sm border border-border/40 bg-background/80 backdrop-blur hover:bg-muted"
                                            onClick={scrollLeft}
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="rounded-xl shadow-sm border border-border/40 bg-background/80 backdrop-blur hover:bg-muted"
                                            onClick={scrollRight}
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <JsonSearchViewer
                data={selectedItemForJson}
                title="Single Transaction JSON"
                open={jsonViewerOpen}
                onOpenChange={setJsonViewerOpen}
            />
        </AppLayout>
    );
}
