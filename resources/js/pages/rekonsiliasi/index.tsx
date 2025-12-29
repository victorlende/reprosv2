import AppLayout from '@/layouts/app-layout';
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader, Loader2, TestTube, Table as TableIcon, Printer, CircleHelp } from 'lucide-react';
import { DynamicDataTable } from '@/components/dynamic-data-table';
import { ReceiptPreview } from '@/components/receipt-preview';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty"
import { FolderX, Search, Download, FileText, FileSpreadsheet, FileJson, Calendar as CalendarIcon, FileCode, CircleCheck, Ban } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { JsonSearchViewer } from '@/components/json-search-viewer';
import { TransactionResultTableModal } from '@/components/transaction-result-table-modal';
import { TransactionCheckModal } from '@/components/transaction-check-modal';
import { DatePickerWithRange } from '@/components/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { getValueByPath, formatValue } from '@/lib/data-utils';
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Rekon FTR - PSW',
        href: '/rekonsiliasi',
    },
];

interface ApiResponse {
    success: boolean;
    data?: any;
    message: string;
    error?: string;
}



interface ColumnMapping {
    label: string;
    path: string;
    type: 'string' | 'currency' | 'date' | 'number';
    substring_start?: number;
    substring_length?: number;
}

interface Template {
    id: number;
    vendor_id: number;
    category: string;
    name: string;
    mapping: {
        table_columns: ColumnMapping[];
    };
    description: string | null;
    valid_response_codes: string | null;
    is_active: boolean;
}

interface Proccode {
    id: number;
    code: string;
    name: string;
    description: string | null;
    source: string;
    category: string | null;
    template_id: number | null;
    receipt_template_id: number | null;
    template?: Template;
    receipt_template?: {
        id: number;
        name: string;
        config: any;
    };
    receipt_config?: {
        title?: string;
        subtitle?: string;
        address?: string;
        logo_left?: string | null;
        logo_right?: string | null;
    };
}

interface Props {
    proccodes: Proccode[];
    maxTransactionDays: number;
}

export default function RekonsiliasiBankIndex({ proccodes, maxTransactionDays }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [selectedProccodeId, setSelectedProccodeId] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    // Initialize with local date string (YYYY-MM-DD)
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });

    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState<'txt' | 'csv' | null>(null);
    const [downloadAllData, setDownloadAllData] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState<string>('');
    const [result, setResult] = useState<ApiResponse | null>(null);
    const [jsonData, setJsonData] = useState<any>(null);
    const [showAllData, setShowAllData] = useState(false);
    // Simulator state removed
    // const [useSimulator, setUseSimulator] = useState(false);

    // Receipt Printing State
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
    const receiptRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: receiptRef,
        documentTitle: 'Struk Transaksi',
    });

    // Transaction Check State
    const [checkModalOpen, setCheckModalOpen] = useState(false);
    const [selectedCheckRow, setSelectedCheckRow] = useState<any>(null);
    const [transactionCheckResult, setTransactionCheckResult] = useState<any>(null);
    const [checkResultViewerOpen, setCheckResultViewerOpen] = useState(false);

    const onCheckClick = (row: any) => {
        setSelectedCheckRow(row);
        setCheckModalOpen(true);
    };

    const handleTransactionCheck = async (type: string, key: string, date: string) => {
        try {
            const res = await window.axios.post('/rekonsiliasi/check-status', { type, key, date });
            setTransactionCheckResult(res.data);
            setCheckResultViewerOpen(true);
        } catch (error: any) {
            console.error("Check failed", error);
            // Even on error (e.g. 404), we might want to show the response body
            if (error.response && error.response.data) {
                setTransactionCheckResult(error.response.data);
                setCheckResultViewerOpen(true);
            } else {
                setTransactionCheckResult({
                    success: false,
                    message: error.message || "Unknown error occurred"
                });
                setCheckResultViewerOpen(true);
            }
        }
    };

    // Get unique categories
    const categories = Array.from(new Set(proccodes.map(p => p.category).filter(Boolean))) as string[];
    const selectedProccode = proccodes.find(p => p.id.toString() === selectedProccodeId);

    // Filter proccodes based on selected category
    const filteredProccodes = proccodes.filter(p => {
        if (selectedCategory === 'all') return true;
        return p.category === selectedCategory;
    });

    // Reset proccode selection when category changes
    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setSelectedProccodeId('');
        setResult(null);
        setJsonData(null);
    };

    const handleFetchData = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (!selectedProccode) {
                throw new Error('Silakan pilih proccode terlebih dahulu');
            }

            if (!dateRange?.from || !dateRange?.to) {
                throw new Error('Silakan pilih rentang tanggal terlebih dahulu');
            }

            // Reset hours to avoid timezone issues affecting comparison
            const start = new Date(dateRange.from);
            const end = new Date(dateRange.to);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            if (end < start) {
                throw new Error('Tanggal akhir tidak boleh kurang dari tanggal mulai');
            }

            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

            if (diffDays > maxTransactionDays) {
                throw new Error(`Rentang tanggal maksimal ${maxTransactionDays} hari`);
            }

            setLoading(true);
            setLoadingMessage('Memeriksa koneksi API...');
            setResult(null);
            setJsonData(null);

            // Check connection first
            try {
                const connectionCheck = await window.axios.post('/rekonsiliasi/check-connection');
                if (connectionCheck.data && !connectionCheck.data.success) {
                    throw new Error(connectionCheck.data.message || 'Gagal terhubung ke API Server');
                }
            } catch (connError: any) {
                // If the check itself fails (e.g. 500 error from Laravel)
                throw new Error(connError.response?.data?.message || connError.message || 'Gagal melakukan pengecekan koneksi');
            }

            setLoadingMessage('Memeriksa periode...');

            const dates: string[] = [];
            const current = new Date(start);
            while (current <= end) {
                const year = current.getFullYear();
                const month = String(current.getMonth() + 1).padStart(2, '0');
                const day = String(current.getDate()).padStart(2, '0');
                dates.push(`${year}-${month}-${day}`);
                current.setDate(current.getDate() + 1);
            }

            const aggregatedXDataTemp: any[] = [];
            let successCount = 0;
            let successItemsCount = 0;

            for (const [index, dateStr] of dates.entries()) {
                setLoadingMessage(`Proses ${index + 1}/${dates.length}: ${dateStr}`);

                try {
                    const response = await window.axios.post('/rekonsiliasi/fetch-data', {
                        proccode: selectedProccode.code,
                        proccode_id: selectedProccode.id, // Send ID for precise lookup
                        tanggal: dateStr,
                        source: selectedProccode.source,
                    });

                    const data = response.data;
                    // Always process items if they exist, regardless of top-level status
                    const items = data.xdatatemp || data.data?.xdatatemp || data.data || [];

                    if (Array.isArray(items) && items.length > 0) {
                        aggregatedXDataTemp.push(...items);

                        if (data.success || data.status === 'SUKSES') {
                            successCount++; // Count successful DAYS
                        }

                        // Get Valid Response Codes
                        const validCodesStr = selectedProccode?.template?.valid_response_codes;
                        const validCodes = validCodesStr
                            ? validCodesStr.split(',').map(c => c.trim())
                            : ['00'];

                        // Count successful items for reporting
                        items.forEach((item: any) => {
                            let rc = item.Wresponcode ?? item.wresponcode ?? item.response_code ?? '00';
                            rc = String(rc).trim();
                            if (rc === '0' && validCodes.includes('00')) rc = '00';

                            if (validCodes.includes(rc)) {
                                successItemsCount++;
                            }
                        });
                    }
                } catch (err) {
                    console.error(`Error fetching ${dateStr}:`, err);
                    continue;
                }
            }

            // Construct merged JSON structure
            setJsonData({
                success: true,
                message: "Aggregated Data",
                xdatatemp: aggregatedXDataTemp
            });

            if (aggregatedXDataTemp.length === 0) {
                setResult({
                    success: false,
                    message: "Tidak ada data ditemukan atau gagal mengambil data dari semua tanggal."
                });
            } else {
                setResult({
                    success: true,
                    message: `Berhasil mengambil data. Total ${aggregatedXDataTemp.length} transaksi (${successItemsCount} sukses, ${aggregatedXDataTemp.length - successItemsCount} gagal).`
                });
            }

        } catch (error) {
            console.error('Fetch error:', error);
            setResult({
                success: false,
                message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data',
            });
        } finally {
            setLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rekon FTR - PSW" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Rekon FTR - PSW</CardTitle>
                        <CardDescription>
                            Ambil data transaksi dari API untuk proses rekonsiliasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Simulator Mode Switch Removed */}

                        <form onSubmit={handleFetchData} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 items-start md:grid-cols-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Kategori Transaksi</Label>
                                    <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                        <SelectTrigger id="category">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Kategori</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category} value={category}>
                                                    {category}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="proccode">Jenis Transaksi</Label>
                                    <Select
                                        value={selectedProccodeId}
                                        onValueChange={(val) => {
                                            setSelectedProccodeId(val);
                                            setResult(null);
                                            setJsonData(null);
                                        }}
                                        required
                                    >
                                        <SelectTrigger id="proccode">
                                            <SelectValue placeholder="Pilih jenis transaksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredProccodes.map((proccode) => (
                                                <SelectItem key={proccode.id} value={proccode.id.toString()}>
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-medium">{proccode.name}</span>
                                                        {selectedCategory === 'all' && proccode.category && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {proccode.category} - {proccode.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                </div>

                                <div className="space-y-2">
                                    <Label>
                                        Periode Transaksi
                                        {dateRange?.from && dateRange?.to && maxTransactionDays > 1 && (
                                            <span className="ml-2 font-normal text-emerald-600 dark:text-emerald-400">
                                                ({Math.ceil(Math.abs(dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24)) + 1} Hari)
                                            </span>
                                        )}
                                    </Label>
                                    <div className="flex gap-2">
                                        <div className="w-full space-y-1">
                                            {maxTransactionDays > 1 ? (
                                                <DatePickerWithRange
                                                    date={dateRange}
                                                    setDate={setDateRange}
                                                    className="w-full"
                                                />
                                            ) : (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !dateRange?.from && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {dateRange?.from ? format(dateRange.from, "PPP", { locale: id }) : <span>Pilih Tanggal</span>}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={dateRange?.from}
                                                            onSelect={(date) => {
                                                                // Set both from and to, to the same date for single day mode compatibility
                                                                setDateRange(date ? { from: date, to: date } : undefined);
                                                            }}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}

                                            {maxTransactionDays > 1 && (
                                                <p className="text-[10px] text-muted-foreground">
                                                    Range Tanggal <span className="text-amber-600 dark:text-amber-500 ml-1">(Maksimal {maxTransactionDays} hari)</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="invisible">Action</Label>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={loading} className="flex-1 min-w-0">
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />}
                                            <span className="truncate">
                                                {loading ? (loadingMessage || 'Mengambil...') : 'Ambil Data'}
                                            </span>
                                        </Button>


                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" disabled={!jsonData?.xdatatemp?.length}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Data
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>Download Data Transaksi</DialogTitle>
                                                    <DialogDescription>
                                                        Pilih format file yang ingin diunduh.
                                                        <br />
                                                        <span className="font-semibold text-foreground">
                                                            {selectedProccode?.name}
                                                            <br />
                                                            {dateRange?.from && dateRange?.to && (
                                                                dateRange.from.getTime() === dateRange.to.getTime()
                                                                    ? dateRange.from.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                    : `${dateRange.from.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${dateRange.to.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                            )}
                                                        </span>
                                                        <br />
                                                        Total: {jsonData?.xdatatemp?.length || 0} data
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="flex items-center space-x-2 rounded-lg border bg-card p-3 my-2">
                                                    <Checkbox
                                                        id="downloadAll"
                                                        checked={downloadAllData}
                                                        onCheckedChange={(checked) => setDownloadAllData(checked as boolean)}
                                                    />
                                                    <label
                                                        htmlFor="downloadAll"
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        Download Semua Data (Termasuk Gagal)
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 py-4 sm:grid-cols-2">
                                                    <div
                                                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-6 text-center transition-all ${downloading ? 'opacity-50 pointer-events-none' : 'hover:border-blue-600 hover:bg-blue-50/50 dark:hover:border-blue-500 dark:hover:bg-blue-950/20'}`}
                                                        onClick={() => {
                                                            if (downloading) return;
                                                            setDownloading('txt');

                                                            // Simulate delay for UX and to allow UI update
                                                            setTimeout(() => {
                                                                const allData = jsonData?.xdatatemp || [];
                                                                const validCodesStr = selectedProccode?.template?.valid_response_codes;
                                                                const validCodes = validCodesStr ? validCodesStr.split(',').map(c => c.trim()) : ['00'];

                                                                const data = downloadAllData
                                                                    ? allData
                                                                    : allData.filter((item: any) => {
                                                                        let rc = item.Wresponcode ?? item.wresponcode ?? item.response_code ?? '00';
                                                                        rc = String(rc).trim();
                                                                        if (rc === '0' && validCodes.includes('00')) rc = '00';
                                                                        return validCodes.includes(rc);
                                                                    });
                                                                const columns = selectedProccode?.template?.mapping?.table_columns;

                                                                let header = '';
                                                                let rows: string[] = [];

                                                                if (columns && columns.length > 0) {
                                                                    header = columns.map(c => c.label).join('|');
                                                                    rows = data.map((row: any) => columns.map(c => {
                                                                        const raw = getValueByPath(row, c.path, c.substring_start, c.substring_length);
                                                                        return formatValue(raw, c.type) ?? '';
                                                                    }).join('|'));
                                                                } else {
                                                                    header = Object.keys(data[0] || {}).join('|');
                                                                    rows = data.map((row: any) => Object.values(row).join('|'));
                                                                }

                                                                const content = [header, ...rows].join('\n');
                                                                const blob = new Blob([content], { type: 'text/plain' });
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                const now = new Date();
                                                                const yy = String(now.getFullYear()).slice(-2);
                                                                const mm = String(now.getMonth() + 1).padStart(2, '0');
                                                                const dd = String(now.getDate()).padStart(2, '0');
                                                                const hh = String(now.getHours()).padStart(2, '0');
                                                                const min = String(now.getMinutes()).padStart(2, '0');
                                                                const ss = String(now.getSeconds()).padStart(2, '0');
                                                                const cleanName = selectedProccode?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || selectedProccode?.code || 'transaksi';
                                                                a.download = `${cleanName}-${yy}${mm}${dd}${hh}${min}${ss}.txt`;
                                                                a.click();

                                                                setDownloading(null);
                                                            }, 800);
                                                        }}
                                                    >
                                                        <div className="mb-3 rounded-full bg-blue-100 p-4 transition-colors group-hover:bg-blue-200 dark:bg-blue-900/40 dark:group-hover:bg-blue-900/60">
                                                            {downloading === 'txt' ? (
                                                                <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
                                                            ) : (
                                                                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                                            )}
                                                        </div>
                                                        <h3 className="mb-1 font-semibold text-foreground">
                                                            {downloading === 'txt' ? 'Mengunduh...' : 'Text File'}
                                                        </h3>
                                                        <span className="mt-3 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                            .txt
                                                        </span>
                                                    </div>

                                                    <div
                                                        className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-muted bg-popover p-6 text-center transition-all ${downloading ? 'opacity-50 pointer-events-none' : 'hover:border-emerald-600 hover:bg-emerald-50/50 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20'}`}
                                                        onClick={() => {
                                                            if (downloading) return;
                                                            setDownloading('csv');

                                                            setTimeout(() => {
                                                                const allData = jsonData?.xdatatemp || [];
                                                                const validCodesStr = selectedProccode?.template?.valid_response_codes;
                                                                const validCodes = validCodesStr ? validCodesStr.split(',').map(c => c.trim()) : ['00'];

                                                                const data = downloadAllData
                                                                    ? allData
                                                                    : allData.filter((item: any) => {
                                                                        let rc = item.Wresponcode ?? item.wresponcode ?? item.response_code ?? '00';
                                                                        rc = String(rc).trim();
                                                                        if (rc === '0' && validCodes.includes('00')) rc = '00';
                                                                        return validCodes.includes(rc);
                                                                    });
                                                                const columns = selectedProccode?.template?.mapping?.table_columns;

                                                                let header = '';
                                                                let rows: string[] = [];

                                                                if (columns && columns.length > 0) {
                                                                    header = columns.map(c => `"${c.label}"`).join(',');
                                                                    rows = data.map((row: any) => columns.map(c => {
                                                                        const raw = getValueByPath(row, c.path, c.substring_start, c.substring_length);
                                                                        const val = formatValue(raw, c.type);
                                                                        return `"${val ?? ''}"`;
                                                                    }).join(','));
                                                                } else {
                                                                    header = Object.keys(data[0] || {}).join(',');
                                                                    rows = data.map((row: any) => Object.values(row).map((val: any) => `"${val}"`).join(','));
                                                                }

                                                                const content = [header, ...rows].join('\n');
                                                                const blob = new Blob([content], { type: 'text/csv' });
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                const now = new Date();
                                                                const yy = String(now.getFullYear()).slice(-2);
                                                                const mm = String(now.getMonth() + 1).padStart(2, '0');
                                                                const dd = String(now.getDate()).padStart(2, '0');
                                                                const hh = String(now.getHours()).padStart(2, '0');
                                                                const min = String(now.getMinutes()).padStart(2, '0');
                                                                const ss = String(now.getSeconds()).padStart(2, '0');
                                                                const cleanName = selectedProccode?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || selectedProccode?.code || 'transaksi';
                                                                a.download = `${cleanName}-${yy}${mm}${dd}${hh}${min}${ss}.csv`;
                                                                a.click();

                                                                setDownloading(null);
                                                            }, 800);
                                                        }}
                                                    >
                                                        <div className="mb-3 rounded-full bg-emerald-100 p-4 transition-colors group-hover:bg-emerald-200 dark:bg-emerald-900/40 dark:group-hover:bg-emerald-900/60">
                                                            {downloading === 'csv' ? (
                                                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
                                                            ) : (
                                                                <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                            )}
                                                        </div>
                                                        <h3 className="mb-1 font-semibold text-foreground">
                                                            {downloading === 'csv' ? 'Mengunduh...' : 'Excel / CSV'}
                                                        </h3>
                                                        <span className="mt-3 rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground">
                                                            .csv
                                                        </span>
                                                    </div>
                                                </div>
                                                <DialogFooter className="sm:justify-between sm:items-center">
                                                    <p className="text-xs text-muted-foreground text-center sm:text-left">
                                                        File akan segera diunduh setelah dipilih
                                                    </p>
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="secondary">
                                                            Tutup
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </div>
                        </form>

                        {result && (
                            <div className="mt-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <Alert
                                    variant={result.success ? 'default' : 'destructive'}
                                    className={cn("flex-1",
                                        result.success ? "border-emerald-600 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-400"
                                            : "border-red-600 text-red-600 bg-red-50 dark:bg-red-950/30 dark:border-red-500 dark:text-red-400"
                                    )}
                                >
                                    {result.success ? (
                                        <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    ) : (
                                        <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    )}
                                    <AlertDescription className={cn(
                                        result.success ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                    )}>
                                        <span>
                                            {result.message}
                                            {(() => {
                                                if (!result.success || !jsonData?.xdatatemp) return null;

                                                // Calculate failed count dynamically
                                                const allData = jsonData.xdatatemp;
                                                const validCodesStr = selectedProccode?.template?.valid_response_codes;
                                                const validCodes = validCodesStr ? validCodesStr.split(',').map(c => c.trim()) : ['00'];

                                                const failedItems = allData.filter((item: any) => {
                                                    let rc = item.Wresponcode ?? item.wresponcode ?? item.response_code ?? '00';
                                                    rc = String(rc).trim();
                                                    if (rc === '0' && validCodes.includes('00')) rc = '00';
                                                    return !validCodes.includes(rc);
                                                });

                                                if (failedItems.length > 0 && !showAllData) {
                                                    return (
                                                        <>
                                                            {" "}
                                                            <span
                                                                className="underline cursor-pointer text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
                                                                onClick={() => setShowAllData(true)}
                                                            >
                                                                Lihat {failedItems.length} data gagal
                                                            </span>
                                                        </>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </span>
                                    </AlertDescription>
                                </Alert>

                                {jsonData && jsonData.xdatatemp && jsonData.xdatatemp.length > 0 && (
                                    <div
                                        className="flex items-center space-x-2 rounded-lg border bg-card p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => setShowAllData(!showAllData)}
                                    >
                                        <Checkbox
                                            id="showAll"
                                            checked={showAllData}
                                            onCheckedChange={(checked) => setShowAllData(checked as boolean)}
                                            className="pointer-events-none"
                                        />
                                        <span
                                            className="text-sm font-medium leading-none text-muted-foreground w-full select-none"
                                        >
                                            Tampilkan Semua Data
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {loading && (
                            <div className="mt-6">
                                <Card>
                                    <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                        <Loader className="h-6 w-6 animate-spin text-muted-foreground mb-4" />
                                        <h3 className="text-lg font-medium">Sedang Mengambil Data</h3>
                                        <p className="text-muted-foreground text-sm max-w-sm mt-2">
                                            {loadingMessage || 'Mohon tunggu sebentar...'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {!jsonData && !loading && (
                            <div className="mt-6">
                                <Card>
                                    <CardContent className="pt-6">
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon" className="h-12 w-12 rounded-xl bg-secondary p-2 mb-2">
                                                    <FileCode className="h-6 w-6 opacity-50" />
                                                </EmptyMedia>

                                                <EmptyTitle className="text-lg font-medium">Belum ada data ditampilkan</EmptyTitle>
                                                <EmptyDescription>
                                                    Silakan pilih parameter transaksi dan klik "Ambil Data" untuk memulai.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {jsonData && (() => {
                            const template = selectedProccode?.template;

                            // Extract data from xdatatemp array
                            const allData = jsonData.xdatatemp || [];

                            // Get Valid Response Codes for filtering
                            const validCodesStr = selectedProccode?.template?.valid_response_codes;
                            const validCodes = validCodesStr
                                ? validCodesStr.split(',').map(c => c.trim())
                                : ['00'];

                            const transactionData = showAllData
                                ? allData
                                : allData.filter((item: any) => {
                                    let rc = item.Wresponcode ?? item.wresponcode ?? item.response_code ?? '00';
                                    rc = String(rc).trim();
                                    if (rc === '0' && validCodes.includes('00')) rc = '00';
                                    return validCodes.includes(rc);
                                });

                            const SummaryInfo = () => (
                                <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-card-foreground shadow-none dark:border-blue-900 dark:bg-blue-950/20">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Jenis Transaksi</div>
                                            <div className="font-semibold">{selectedProccode?.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Proccode</div>
                                            <div className="font-mono font-semibold">{selectedProccode?.code}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-muted-foreground">Tanggal Transaksi</div>
                                            <div className="font-semibold">
                                                {dateRange?.from && dateRange?.to && (
                                                    dateRange.from.getTime() === dateRange.to.getTime() ? (
                                                        dateRange.from.toLocaleDateString('id-ID', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })
                                                    ) : (
                                                        `${dateRange.from.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${dateRange.to.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );

                            if (transactionData.length === 0) {
                                return (
                                    <div className="mt-6">
                                        <SummaryInfo />
                                        <Card>
                                            <CardContent className="pt-6">
                                                <Empty>
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon" className="h-12 w-12 rounded-xl bg-secondary p-2 mb-2">
                                                            <CircleHelp className="h-6 w-6 opacity-50" />
                                                        </EmptyMedia>
                                                        <EmptyTitle className="text-lg font-medium">Tidak ada data transaksi</EmptyTitle>
                                                        <EmptyDescription>
                                                            Tidak ditemukan data transaksi untuk proccode dan tanggal yang dipilih.
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                    <EmptyContent>
                                                        <Button variant="outline" onClick={() => window.location.reload()}>
                                                            Refresh Halaman
                                                        </Button>
                                                    </EmptyContent>
                                                </Empty>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            }

                            if (template && template.mapping && template.mapping.table_columns) {
                                // Render Dynamic Table
                                return (
                                    <div className="mt-6">
                                        <SummaryInfo />
                                        <DynamicDataTable
                                            data={transactionData}
                                            columns={template.mapping.table_columns}
                                            title={`Data Transaksi - ${selectedProccode?.name}`}
                                            description={`${transactionData.length} transaksi ditemukan`}
                                            renderRowActions={(row) => {
                                                const hasPrintAccess = auth.user.role === 'super_user' || (auth.user.accessible_menus && auth.user.accessible_menus.includes('feature.print_receipt'));

                                                if (!selectedProccode?.receipt_template || !hasPrintAccess) return null;

                                                return (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8"
                                                        onClick={() => {
                                                            setSelectedTransaction(row);
                                                            setReceiptModalOpen(true);
                                                        }}
                                                    >
                                                        <Printer className="mr-2 h-3.5 w-3.5" />
                                                        Cetak
                                                    </Button>
                                                );
                                            }}
                                            rowClassName={(row) => {
                                                const rc = String(row.Wresponcode ?? row.wresponcode ?? row.response_code ?? '00').trim();
                                                return rc !== '00' ? "bg-red-100/50 hover:bg-red-100/70 dark:bg-red-900/10 dark:hover:bg-red-900/20" : "";
                                            }}
                                            headerAction={
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCheckRow(null);
                                                            setCheckModalOpen(true);
                                                        }}
                                                    >
                                                        <Search className="mr-2 h-4 w-4" />
                                                        Cek Status T24
                                                    </Button>
                                                    <JsonSearchViewer
                                                        data={jsonData}
                                                        title={`Raw JSON Data - ${selectedProccode?.name}`}
                                                        trigger={
                                                            <Button variant="outline" size="sm">
                                                                <FileJson className="mr-2 h-4 w-4" />
                                                                Lihat JSON Data
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            }
                                        />
                                    </div>
                                );
                            }

                            // Fallback: Show JSON if no template
                            return (
                                <div className="mt-6">
                                    <SummaryInfo />
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Data JSON</CardTitle>
                                            <CardDescription>
                                                Template tidak tersedia - Menampilkan raw data
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900">
                                                <pre className="overflow-auto text-xs">
                                                    {JSON.stringify(jsonData, null, 2)}
                                                </pre>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            );
                        })()}
                    </CardContent>
                </Card>
            </div>

            {/* Receipt Modal */}
            <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
                <DialogContent className="sm:max-w-[950px] max-h-[90vh] overflow-y-auto w-full">
                    <DialogHeader>
                        <DialogTitle>Cetak Struk Transaksi</DialogTitle>
                        <DialogDescription>
                            Preview struk sebelum dicetak.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex justify-center bg-gray-100 p-8 rounded-lg dark:bg-gray-900 border">
                        <div ref={receiptRef}>
                            {selectedProccode?.receipt_template && selectedTransaction && (() => {
                                // Merge configurations: Proccode config overrides Template config for Header
                                const templateConfig = selectedProccode.receipt_template!.config;
                                const proccodeConfig = selectedProccode.receipt_config || {};

                                const mergedConfig = {
                                    ...templateConfig,
                                    header: {
                                        ...templateConfig.header,
                                        title: proccodeConfig.title || templateConfig.header.title,
                                        subtitle: proccodeConfig.subtitle || templateConfig.header.subtitle,
                                        address: proccodeConfig.address || templateConfig.header.address,
                                        logo_left: proccodeConfig.logo_left || templateConfig.header.logo_left,
                                        logo_right: proccodeConfig.logo_right || templateConfig.header.logo_right,
                                    }
                                };

                                return (
                                    <ReceiptPreview
                                        config={mergedConfig}
                                        data={selectedTransaction}
                                    />
                                );
                            })()}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="secondary" onClick={() => setReceiptModalOpen(false)}>
                            Tutup
                        </Button>
                        <Button onClick={handlePrint}>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <TransactionCheckModal
                isOpen={checkModalOpen}
                onClose={() => setCheckModalOpen(false)}
                initialData={selectedCheckRow}
                onCheck={handleTransactionCheck}
            />

            <TransactionResultTableModal
                data={transactionCheckResult}
                isOpen={checkResultViewerOpen}
                onClose={() => setCheckResultViewerOpen(false)}
            />
        </AppLayout >
    );
}
