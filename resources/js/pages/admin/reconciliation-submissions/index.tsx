import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Plus, Upload, Download, RefreshCw, FileText, FileChartColumn, CalendarIcon, Pencil } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Rekonsiliasi',
        href: '/admin/reconciliation-submissions',
    },
];

interface User {
    id: number;
    name: string;
}

interface Proccode {
    id: number;
    name: string;
    code: string;
}

interface EmailDestination {
    id: number;
    name: string;
    email: string;
}

interface ReconciliationSubmissionDestination {
    id: number;
    email_destination: EmailDestination;
    status: string;
}

interface ReconciliationSubmissionFile {
    id: number;
    file_name: string;
    file_size: number;
    file_path: string;
}

interface ReconciliationSubmission {
    id: number;
    proccode: Proccode | null;
    destinations: ReconciliationSubmissionDestination[];
    files: ReconciliationSubmissionFile[];
    user: User;
    subject: string;
    status: string;
    sent_at: string | null;
    transaction_date_start: string | null;
    transaction_date_end: string | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    data: ReconciliationSubmission[];
}

interface Props {
    submissions: Pagination;
    proccodes: Proccode[];
    users: User[];
    filters: {
        start_date?: string;
        end_date?: string;
        status?: string;
        proccode_id?: string;
        user_id?: string;
    };
}

function ReconciliationSubmissionsIndex({ submissions, proccodes, users, filters }: Props) {
    const [startDate, setStartDate] = useState<Date | undefined>(filters.start_date ? new Date(filters.start_date) : undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(filters.end_date ? new Date(filters.end_date) : undefined);

    const [filterData, setFilterData] = useState({
        status: filters.status || 'all',
        proccode_id: filters.proccode_id || 'all',
        user_id: filters.user_id || 'all',
    });

    const handleFilter = () => {
        const submitData = {
            ...filterData,
            start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
            end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
            status: filterData.status === 'all' ? undefined : filterData.status,
            proccode_id: filterData.proccode_id === 'all' ? undefined : filterData.proccode_id,
            user_id: filterData.user_id === 'all' ? undefined : filterData.user_id,
        };
        router.get('/admin/reconciliation-submissions', submitData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setFilterData({
            status: 'all',
            proccode_id: 'all',
            user_id: 'all',
        });
        router.get('/admin/reconciliation-submissions', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResend = (id: number) => {
        if (confirm('Kirim ulang email ini?')) {
            router.post(`/admin/reconciliation-submissions/${id}/resend`, {}, {
                preserveState: true,
            });
        }
    };

    const handleDownload = (id: number) => {
        window.location.href = `/admin/reconciliation-submissions/${id}/download`;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'sent':
                return <Badge variant="default" className="bg-green-500">Terkirim</Badge>;
            case 'failed':
                return <Badge variant="destructive">Gagal</Badge>;
            case 'pending':
                return <Badge variant="secondary">Pending</Badge>;
            case 'draft':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-200">Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="History Pengiriman Rekonsiliasi" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Pengiriman Rekonsiliasi</h1>
                        <p className="text-muted-foreground mt-1">History upload dan pengiriman file rekonsiliasi</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/admin/reconciliation-submissions/report">
                            <Button variant="outline">
                                <FileChartColumn className="mr-2 h-4 w-4" />
                                Laporan
                            </Button>
                        </Link>
                        <Link href="/admin/reconciliation-submissions/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Upload & Kirim
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filter Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Filter</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="flex flex-col xl:flex-row gap-4 items-end">
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

                            <div className="grid gap-2 w-full xl:w-[200px]">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={filterData.status}
                                    onValueChange={(value) => setFilterData({ ...filterData, status: value })}
                                >
                                    <SelectTrigger className="bg-background shadow-none">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="sent">Terkirim</SelectItem>
                                        <SelectItem value="failed">Gagal</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2 w-full xl:w-[200px]">
                                <Label htmlFor="proccode_id">Jenis Transaksi</Label>
                                <Select
                                    value={filterData.proccode_id}
                                    onValueChange={(value) => setFilterData({ ...filterData, proccode_id: value })}
                                >
                                    <SelectTrigger className="bg-background shadow-none">
                                        <SelectValue placeholder="Semua Jenis" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis</SelectItem>
                                        {proccodes.map((proccode) => (
                                            <SelectItem key={proccode.id} value={proccode.id.toString()}>
                                                {proccode.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2 w-full xl:w-[200px]">
                                <Label htmlFor="user_id">Pengirim</Label>
                                <Select
                                    value={filterData.user_id}
                                    onValueChange={(value) => setFilterData({ ...filterData, user_id: value })}
                                >
                                    <SelectTrigger className="bg-background shadow-none">
                                        <SelectValue placeholder="Semua Pengirim" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Pengirim</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2">
                                <Button onClick={handleFilter} className="shadow-none">Terapkan</Button>
                                <Button variant="outline" onClick={handleReset} className="shadow-none">Reset</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Pengiriman</CardTitle>
                        <CardDescription>
                            Total: {submissions.total} pengiriman
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Periode Transaksi</TableHead>
                                        <TableHead>Pengirim</TableHead>
                                        <TableHead>Email Tujuan</TableHead>
                                        <TableHead>File</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {submissions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <FileText className="h-8 w-8 opacity-20" />
                                                    <p>Belum ada data pengiriman</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        submissions.data.map((submission, index) => (
                                            <TableRow key={submission.id}>
                                                <TableCell className="font-medium">
                                                    {(submissions.current_page - 1) * submissions.per_page + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {submission.sent_at
                                                            ? formatDate(submission.sent_at)
                                                            : formatDate(submission.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {submission.transaction_date_start && submission.transaction_date_end ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {(() => {
                                                                const startDate = format(new Date(submission.transaction_date_start), 'dd MMM yyyy', { locale: id });
                                                                const endDate = format(new Date(submission.transaction_date_end), 'dd MMM yyyy', { locale: id });
                                                                return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
                                                            })()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-medium">{submission.user.name}</TableCell>
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
                                                    <div className="flex flex-col gap-2">
                                                        {submission.files && submission.files.length > 0 ? (
                                                            submission.files.map((file, i) => (
                                                                <div key={i} className="text-sm">
                                                                    <div className="font-medium">{file.file_name}</div>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {formatFileSize(file.file_size)}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground italic">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDownload(submission.id)}
                                                                    >
                                                                        <Download className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Download File</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {submission.status === 'draft' && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Link href={`/admin/reconciliation-submissions/${submission.id}/edit`}>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Button>
                                                                        </Link>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit Draft</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}

                                                        {(submission.status === 'failed' || submission.status === 'partial') && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => handleResend(submission.id)}
                                                                        >
                                                                            <RefreshCw className="h-4 w-4" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Kirim Ulang</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {submissions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {(submissions.current_page - 1) * submissions.per_page + 1} to{' '}
                                    {Math.min(submissions.current_page * submissions.per_page, submissions.total)} of{' '}
                                    {submissions.total} results
                                </div>
                                <div className="flex gap-2">
                                    {Array.from({ length: submissions.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === submissions.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => {
                                                router.get(
                                                    '/admin/reconciliation-submissions',
                                                    { ...filterData, page },
                                                    { preserveState: true, preserveScroll: true }
                                                );
                                            }}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card >
            </div >
        </AppLayout >
    );
}

export default ReconciliationSubmissionsIndex;
