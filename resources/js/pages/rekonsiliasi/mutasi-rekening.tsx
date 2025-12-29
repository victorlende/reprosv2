import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon, Search, Loader2, FileText, Check, ChevronsUpDown, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface Vendor {
    id: number;
    name: string;
    description: string;
}

interface MutasiRekeningProps {
    vendors: Vendor[];
}

// Mock Account Data
const mockAccounts = [
    { value: "1234567890", label: "1234567890 - John Doe" },
    { value: "0987654321", label: "0987654321 - Jane Smith" },
    { value: "1122334455", label: "1122334455 - PT Maju Jaya" },
    { value: "5566778899", label: "5566778899 - CV Abadi" },
    { value: "9988776655", label: "9988776655 - Budi Santoso" },
]

export default function MutasiRekening({ vendors }: MutasiRekeningProps) {
    const breadcrumbs = [
        { title: 'Rekonsiliasi', href: '/rekonsiliasi' },
        { title: 'Mutasi Rekening', href: '/rekonsiliasi/mutasi-rekening' },
    ];

    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedVendor, setSelectedVendor] = useState<string>("");
    const [accountNumber, setAccountNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [openAccount, setOpenAccount] = useState(false);

    // Mock data for now, replace with actual API results later
    const [data, setData] = useState<any[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVendor || !accountNumber || !startDate || !endDate) return;

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setHasSearched(true);
            // Example data
            setData([]);
        }, 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mutasi Rekening" />
            <div className="flex bg-muted/10 h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Mutasi Rekening</h1>
                    <p className="text-muted-foreground">Lihat riwayat transaksi dan mutasi rekening vendor.</p>
                </div>

                <Card className="max-w-6xl border-border/60 shadow-none">
                    <CardHeader>
                        <CardTitle className="text-base">Parameter Pencarian</CardTitle>
                        <CardDescription>
                            Lengkapi form di bawah ini untuk menampilkan data mutasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <form onSubmit={handleSearch} className="flex flex-col xl:flex-row gap-4 items-end">
                            <div className="grid gap-2 w-full xl:w-[250px]">
                                <Label htmlFor="vendor">Vendor</Label>
                                <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                    <SelectTrigger id="vendor" className="bg-background shadow-none">
                                        <SelectValue placeholder="Pilih Vendor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vendors.map((vendor) => (
                                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2 w-full xl:w-[250px]">
                                <Label htmlFor="account">Nomor Rekening</Label>
                                <Popover open={openAccount} onOpenChange={setOpenAccount}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openAccount}
                                            className="w-full justify-between bg-background shadow-none font-normal"
                                        >
                                            {accountNumber
                                                ? mockAccounts.find((acc) => acc.value === accountNumber)?.label
                                                : "Pilih Rekening..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Cari nomor rekening..." />
                                            <CommandList>
                                                <CommandEmpty>No account found.</CommandEmpty>
                                                <CommandGroup>
                                                    {mockAccounts.map((framework) => (
                                                        <CommandItem
                                                            key={framework.value}
                                                            value={framework.value}
                                                            onSelect={(currentValue) => {
                                                                setAccountNumber(currentValue === accountNumber ? "" : currentValue)
                                                                setOpenAccount(false)
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    accountNumber === framework.value ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {framework.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2 w-full xl:w-[200px]">
                                <Label>Tanggal Awal</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background shadow-none",
                                                !startDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {startDate ? format(startDate, "dd MMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={startDate}
                                            onSelect={setStartDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="grid gap-2 w-full xl:w-[200px]">
                                <Label>Tanggal Akhir</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal bg-background shadow-none",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "dd MMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="w-full xl:w-[150px]">
                                <Button type="submit" disabled={loading} size="default" className="w-full shadow-none h-10">
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="mr-2 h-4 w-4" />
                                            Ambil Data
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
                            <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                <div className="space-y-1.5">
                                    <CardTitle className="text-base">Hasil Mutasi</CardTitle>
                                    <CardDescription>
                                        Menampilkan data mutasi rekening berdasarkan periode yang dipilih.
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" className="h-8 shadow-none gap-2">
                                    <Download className="h-3.5 w-3.5" />
                                    Download File
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-xl border border-border/60 shadow-none bg-background overflow-hidden relative">
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="min-w-full">
                                            <table className="w-full border-collapse text-sm">
                                                <thead className="bg-muted/40 text-muted-foreground font-medium">
                                                    <tr className="border-b border-border/50">
                                                        <th className="px-4 py-3 text-left w-[50px]">No</th>
                                                        <th className="px-4 py-3 text-left">Tanggal</th>
                                                        <th className="px-4 py-3 text-left">No. Arsip</th>
                                                        <th className="px-4 py-3 text-left">Keterangan Transaksi</th>
                                                        <th className="px-4 py-3 text-left">dbcr</th>
                                                        <th className="px-4 py-3 text-left">ArrTxId</th>
                                                        <th className="px-4 py-3 text-right">Jml Trx</th>
                                                        <th className="px-4 py-3 text-right">Saldo</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-background">
                                                    {data.length > 0 ? (
                                                        data.map((item, idx) => (
                                                            <tr key={idx} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                                                                <td className="px-4 py-3">{idx + 1}</td>
                                                                <td className="px-4 py-3">{item.tanggal}</td>
                                                                <td className="px-4 py-3">{item.no_arsip}</td>
                                                                <td className="px-4 py-3">{item.keterangan}</td>
                                                                <td className="px-4 py-3">{item.dbcr}</td>
                                                                <td className="px-4 py-3">{item.arrtxid}</td>
                                                                <td className="px-4 py-3 text-right">{item.jml_trx}</td>
                                                                <td className="px-4 py-3 text-right">{item.saldo}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={8} className="px-4 py-12 text-center">
                                                                <div className="flex flex-col items-center justify-center gap-2">
                                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary p-2 mb-2">
                                                                        <FileText className="h-6 w-6 opacity-50" />
                                                                    </div>
                                                                    <h3 className="text-lg font-medium tracking-tight">Tidak Ada Data</h3>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Tidak ditemukan data mutasi untuk periode ini.
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
