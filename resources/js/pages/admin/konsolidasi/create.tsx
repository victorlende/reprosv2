import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, Save, Calendar as CalendarIcon } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { District, Proccode } from './types';
import { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface Props {
    districts: District[];
    proccodes: Proccode[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konsolidasi Data', href: '/admin/konsolidasi' },
    { title: 'Ambil Data Baru', href: '/admin/konsolidasi/create' },
];

export default function KonsolidasiCreate({ districts, proccodes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        district_id: '',
        proccode_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
    });

    const [previewData, setPreviewData] = useState<any>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const handlePreview = async () => {
        if (!data.proccode_id || !data.start_date || !data.end_date) {
            alert("Harap lengkapi Jenis Transaksi dan Tanggal terlebih dahulu.");
            return;
        }

        setPreviewLoading(true);
        setPreviewData(null);
        setShowPreview(true);

        try {
            const res = await window.axios.post('/admin/konsolidasi/preview', {
                proccode_id: data.proccode_id,
                start_date: data.start_date,
                end_date: data.end_date,
            });
            setPreviewData(res.data);
        } catch (error: any) {
            console.error("Preview failed", error);
            setPreviewData({ success: false, message: error.response?.data?.message || error.message });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/konsolidasi');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Ambil Data Konsolidasi" />

            <div className="flex-1 p-4 md:p-8 pt-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/konsolidasi')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Ambil Data Baru</h2>
                        <p className="text-muted-foreground">
                            Tarik data dari API dan simpan ke database konsolidasi.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                    <Card className="w-full md:w-[420px] shrink-0 h-fit">
                        <CardHeader>
                            <CardTitle>Parameter Data</CardTitle>
                            <CardDescription>
                                Pilih Kabupaten dan Jenis Transaksi untuk pengambilan data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Kabupaten</Label>
                                    <Select
                                        value={data.district_id}
                                        onValueChange={(val) => setData('district_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Kabupaten..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.map(d => (
                                                <SelectItem key={d.id} value={d.id.toString()}>
                                                    {d.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.district_id && (
                                        <p className="text-sm text-red-500">{errors.district_id}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label>Jenis Transaksi (Proccode)</Label>
                                    <Select
                                        value={data.proccode_id}
                                        onValueChange={(val) => {
                                            setData('proccode_id', val);
                                            setPreviewData(null);
                                            setShowPreview(false);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih Jenis Transaksi..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {proccodes.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.proccode_id && (
                                        <p className="text-sm text-red-500">{errors.proccode_id}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Dari Tanggal</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-background shadow-none",
                                                        !data.start_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.start_date ? format(new Date(data.start_date), "dd/MM/yyyy") : <span>Pilih Tanggal</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.start_date ? new Date(data.start_date) : undefined}
                                                    onSelect={(date) => {
                                                        setData('start_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                        setPreviewData(null);
                                                        setShowPreview(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.start_date && (
                                            <p className="text-sm text-red-500">{errors.start_date}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Sampai Tanggal</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-background shadow-none",
                                                        !data.end_date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.end_date ? format(new Date(data.end_date), "dd/MM/yyyy") : <span>Pilih Tanggal</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.end_date ? new Date(data.end_date) : undefined}
                                                    onSelect={(date) => {
                                                        setData('end_date', date ? format(date, 'yyyy-MM-dd') : '');
                                                        setPreviewData(null);
                                                        setShowPreview(false);
                                                    }}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.end_date && (
                                            <p className="text-sm text-red-500">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={handlePreview}
                                        disabled={previewLoading || !data.proccode_id}
                                        className="w-full"
                                    >
                                        {previewLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Mengecek Data...
                                            </>
                                        ) : (
                                            "Cek Data (Preview)"
                                        )}
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing || !previewData?.success}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                Simpan Permanen
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground text-center">
                                        Tombol Simpan aktif setelah preview berhasil.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="flex-1 space-y-6">
                        {showPreview && (
                            <Card className="h-full border-border/60 shadow-none">
                                <CardHeader>
                                    <CardTitle>Hasil Preview</CardTitle>
                                    <CardDescription>
                                        Ringkasan data yang akan disimpan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {previewLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                            <Loader2 className="h-8 w-8 animate-spin mb-4" />
                                            <p>Sedang mengambil data dari API...</p>
                                        </div>
                                    ) : previewData ? (
                                        previewData.success ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="rounded-lg border p-3 text-center">
                                                        <div className="text-xs font-medium text-muted-foreground uppercase">Total Transaksi</div>
                                                        <div className="text-2xl font-bold text-foreground">
                                                            {previewData.summary.total_items}
                                                        </div>
                                                    </div>
                                                    <div className="rounded-lg border p-3 text-center">
                                                        <div className="text-xs font-medium text-muted-foreground uppercase">Total Nominal</div>
                                                        <div className="text-xl font-bold text-foreground">
                                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(previewData.summary.total_nominal)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="rounded-md border">
                                                    <div className="bg-muted/50 p-2 text-xs font-medium border-b flex justify-between">
                                                        <span>Preview Detail Transaksi ({previewData.data.length})</span>
                                                    </div>
                                                    <div className="max-h-[300px] overflow-auto">
                                                        <table className="w-full text-xs">
                                                            <thead className="bg-background sticky top-0">
                                                                <tr>
                                                                    {previewData.headers && previewData.headers.length > 0 ? (
                                                                        previewData.headers.map((h: any) => (
                                                                            <th key={h.key} className={cn(
                                                                                "p-2 font-medium border-b",
                                                                                (h.type === 'currency' || h.type === 'number') ? "text-right" : "text-left"
                                                                            )}>
                                                                                {h.label}
                                                                            </th>
                                                                        ))
                                                                    ) : (
                                                                        <>
                                                                            <th className="p-2 text-left font-medium">Tanggal</th>
                                                                            <th className="p-2 text-right font-medium">Nominal</th>
                                                                        </>
                                                                    )}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {previewData.data.map((item: any, idx: number) => (
                                                                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/10">
                                                                        {previewData.headers && previewData.headers.length > 0 ? (
                                                                            previewData.headers.map((h: any) => (
                                                                                <td key={h.key} className={cn(
                                                                                    "p-2",
                                                                                    (h.type === 'currency' || h.type === 'number') ? "text-right font-mono" : "text-left"
                                                                                )}>
                                                                                    {h.type === 'currency'
                                                                                        ? new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(item[h.key] || 0))
                                                                                        : item[h.key]}
                                                                                </td>
                                                                            ))
                                                                        ) : (
                                                                            <>
                                                                                <td className="p-2">{item.transaction_date}</td>
                                                                                <td className="p-2 text-right font-mono">
                                                                                    {new Intl.NumberFormat('id-ID').format(item.nominal)}
                                                                                </td>
                                                                            </>
                                                                        )}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-yellow-800 text-xs dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-200">
                                                    <strong>Konfirmasi:</strong> Pastikan angka di atas sudah sesuai sebelum mengklik tombol Simpan. Data lama pada rentang tanggal tersebut akan tertimpa.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-red-500">
                                                <p className="font-medium">Gagal Memuat Data</p>
                                                <p className="text-sm mt-1">{previewData.message}</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground/50 border-2 border-dashed rounded-lg">
                                            Klik "Cek Data" untuk memulai preview
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
