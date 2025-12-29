import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2, Search, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import axios from 'axios';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CheckResult {
    account_number: string;
    owner_name: string;
    status: string;
}

export default function AccountNumbersIndex() {
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Cek Rekening', href: '/admin/account-numbers' },
    ];

    const [accounts, setAccounts] = useState<string[]>(['']);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<CheckResult[]>([]);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addAccount = () => {
        if (accounts.length < 10) {
            setAccounts([...accounts, '']);
        }
    };

    const removeAccount = (index: number) => {
        const newAccounts = [...accounts];
        newAccounts.splice(index, 1);
        setAccounts(newAccounts);
    };

    const updateAccount = (index: number, value: string) => {
        const newAccounts = [...accounts];
        newAccounts[index] = value;
        setAccounts(newAccounts);
    };

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        const validAccounts = accounts.filter(a => a.trim() !== '');

        if (validAccounts.length === 0) {
            setError("Masukkan setidaknya satu nomor rekening.");
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await axios.post(route('admin.account-numbers.check'), {
                account_numbers: validAccounts
            });
            setResults(response.data);
            setSearched(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat mengecek nomor rekening.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cek Nomor Rekening" />
            <div className="flex bg-muted/10 h-full flex-1 flex-col gap-4 overflow-x-auto p-4 md:p-6">
                <div className="mb-2">
                    <h1 className="text-2xl font-bold tracking-tight">Cek Nomor Rekening</h1>
                    <p className="text-muted-foreground">Verifikasi data nomor rekening secara massal (Max 10).</p>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    <div className="md:col-span-4 lg:col-span-4">
                        <Card className="border-border/60 shadow-none h-full">
                            <CardHeader>
                                <CardTitle className="text-base">Input Data</CardTitle>
                                <CardDescription>
                                    Tambahkan nomor rekening yang ingin dicek.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCheck} className="flex flex-col gap-4">
                                    <div className="space-y-3">
                                        {accounts.map((acc, index) => (
                                            <div key={index} className="flex gap-2">
                                                <Input
                                                    placeholder={`No. Rekening ${index + 1}`}
                                                    value={acc}
                                                    onChange={(e) => updateAccount(index, e.target.value)}
                                                    className="bg-background shadow-none"
                                                />
                                                {accounts.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeAccount(index)}
                                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {accounts.length < 10 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addAccount}
                                            className="w-full border-dashed border-border/60 shadow-none text-muted-foreground hover:text-foreground"
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Tambah Input
                                        </Button>
                                    )}

                                    {error && (
                                        <Alert variant="destructive" className="py-2">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button type="submit" disabled={loading} className="w-full mt-2 shadow-none">
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Cek Nomor Rekening
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="md:col-span-8 lg:col-span-8">
                        <Card className="border-border/60 shadow-none h-full min-h-[400px]">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base">Hasil Pengecekan</CardTitle>
                                <CardDescription>
                                    Informasi status dan pemilik rekening.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {searched ? (
                                    <div className="rounded-xl border border-border/60 shadow-none bg-background overflow-hidden relative">
                                        <div className="min-w-full">
                                            <table className="w-full border-collapse text-sm">
                                                <thead className="bg-muted/40 text-muted-foreground font-medium">
                                                    <tr className="border-b border-border/50">
                                                        <th className="px-4 py-3 text-left w-[50px]">No</th>
                                                        <th className="px-4 py-3 text-left">Nomor Rekening</th>
                                                        <th className="px-4 py-3 text-left">Nama Pemilik</th>
                                                        <th className="px-4 py-3 text-left">Status</th>
                                                        <th className="px-4 py-3 text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-background">
                                                    {results.length > 0 ? (
                                                        results.map((item, idx) => (
                                                            <tr key={idx} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                                                                <td className="px-4 py-3">{idx + 1}</td>
                                                                <td className="px-4 py-3 font-mono">{item.account_number}</td>
                                                                <td className="px-4 py-3 font-medium">{item.owner_name}</td>
                                                                <td className="px-4 py-3">
                                                                    <span className={cn(
                                                                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                                                                        item.status === 'Active'
                                                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                                                            : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                                                    )}>
                                                                        {item.status === 'Active' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                                                                        Detail
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                                                                Tidak ada hasil ditemukan.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon" className="h-12 w-12 rounded-xl bg-secondary p-2 mb-2">
                                                <Search className="h-6 w-6 opacity-50" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-lg font-medium">Belum ada data</EmptyTitle>
                                            <EmptyDescription>
                                                Masukkan nomor rekening di sebelah kiri dan klik "Cek" untuk melihat hasil.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
