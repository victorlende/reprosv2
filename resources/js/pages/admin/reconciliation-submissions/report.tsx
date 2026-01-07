import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Download, Calendar, FileSpreadsheet } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Rekonsiliasi',
        href: '/admin/reconciliation-submissions',
    },
    {
        title: 'Laporan',
        href: '/admin/reconciliation-submissions/report',
    },
];

interface User {
    id: number;
    name: string;
}

interface Proccode {
    id: number;
    name: string;
}

interface EmailDestination {
    id: number;
    name: string;
    email: string;
}

interface Submission {
    id: number;
    proccode: Proccode | null;
    destinations: { email_destination: EmailDestination }[];
    files: { file_name: string }[];
    user: User;
    status: string;
    sent_at: string;
    transaction_date_start: string | null;
    transaction_date_end: string | null;
}

interface ReportData {
    user_name: string;
    total: number;
    sent: number;
    failed: number;
}

interface Props {
    title: string;
    type: string;
    date: string;
    reportData: ReportData[];
    submissions: Submission[];
}

function ReconciliationSubmissionsReport({ title, type, date, reportData, submissions }: Props) {
    const [filterData, setFilterData] = useState({
        type: type,
        date: date,
    });

    const handleFilter = () => {
        router.get('/admin/reconciliation-submissions/report', filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleExport = () => {
        window.location.href = `/admin/reconciliation-submissions/export-report?type=${filterData.type}&date=${filterData.date}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalAll = reportData.reduce((sum, data) => sum + data.total, 0);
    const totalSent = reportData.reduce((sum, data) => sum + data.sent, 0);
    const totalFailed = reportData.reduce((sum, data) => sum + data.failed, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Pengiriman Rekonsiliasi" />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/reconciliation-submissions">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                {/* Filter Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Pilih Periode Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="type">Tipe Laporan</Label>
                                <Select
                                    value={filterData.type}
                                    onValueChange={(value) => setFilterData({ ...filterData, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Harian</SelectItem>
                                        <SelectItem value="monthly">Bulanan</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">
                                    {filterData.type === 'daily' ? 'Tanggal' : 'Bulan'}
                                </Label>
                                <Input
                                    id="date"
                                    type={filterData.type === 'daily' ? 'date' : 'month'}
                                    value={filterData.date}
                                    onChange={(e) => setFilterData({ ...filterData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>&nbsp;</Label>
                                <div className="flex gap-2">
                                    <Button onClick={handleFilter} className="flex-1">
                                        Tampilkan
                                    </Button>
                                    <Button onClick={handleExport} variant="outline">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export Excel
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Total Pengiriman
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalAll}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Berhasil
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600">{totalSent}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Gagal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{totalFailed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Table */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>Ringkasan pengiriman per staff</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama Staff</TableHead>
                                        <TableHead className="text-center">Total Pengiriman</TableHead>
                                        <TableHead className="text-center">Berhasil</TableHead>
                                        <TableHead className="text-center">Gagal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <FileSpreadsheet className="h-8 w-8 opacity-20" />
                                                    <p>Tidak ada data untuk periode ini</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {reportData.map((data, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{data.user_name}</TableCell>
                                                    <TableCell className="text-center">{data.total}</TableCell>
                                                    <TableCell className="text-center text-green-600 font-medium">
                                                        {data.sent}
                                                    </TableCell>
                                                    <TableCell className="text-center text-red-600 font-medium">
                                                        {data.failed}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-muted/50 font-bold">
                                                <TableCell colSpan={2} className="text-center">TOTAL</TableCell>
                                                <TableCell className="text-center">{totalAll}</TableCell>
                                                <TableCell className="text-center text-green-600">{totalSent}</TableCell>
                                                <TableCell className="text-center text-red-600">{totalFailed}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Detail Table */}
                {submissions.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Pengiriman</CardTitle>
                            <CardDescription>Daftar lengkap pengiriman pada periode ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">#</TableHead>
                                            <TableHead>Tanggal Kirim</TableHead>
                                            <TableHead>Periode Transaksi</TableHead>
                                            <TableHead>Pengirim</TableHead>
                                            <TableHead>Email Tujuan</TableHead>
                                            <TableHead>File</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {submissions.map((submission, index) => (
                                            <TableRow key={submission.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>{formatDate(submission.sent_at)}</TableCell>
                                                <TableCell>
                                                    {submission.transaction_date_start && submission.transaction_date_end ? (
                                                        <span className="text-sm">
                                                            {(() => {
                                                                const startFormatted = formatDate(submission.transaction_date_start);
                                                                const endFormatted = formatDate(submission.transaction_date_end);
                                                                const startDateOnly = startFormatted.split(' ').slice(0, 3).join(' ');
                                                                const endDateOnly = endFormatted.split(' ').slice(0, 3).join(' ');
                                                                return startDateOnly === endDateOnly ? startDateOnly : `${startDateOnly} - ${endDateOnly}`;
                                                            })()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{submission.user.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {submission.destinations && submission.destinations.length > 0 ? (
                                                            submission.destinations.map((dest, i) => (
                                                                <div key={i} className="text-sm">
                                                                    <div className="font-medium">{dest.email_destination?.name || 'Unknown'}</div>
                                                                    <code className="text-xs text-muted-foreground">
                                                                        {dest.email_destination?.email || '-'}
                                                                    </code>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1">
                                                        {submission.files && submission.files.length > 0 ? (
                                                            submission.files.map((file, i) => (
                                                                <div key={i} className="text-sm">
                                                                    {file.file_name}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs font-medium ${submission.status === 'sent'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700'
                                                            }`}
                                                    >
                                                        {submission.status === 'sent' ? 'Terkirim' : 'Gagal'}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

export default ReconciliationSubmissionsReport;
