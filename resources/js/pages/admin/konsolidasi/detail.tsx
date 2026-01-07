import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FileJson, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { ConsolidationItem, District, Proccode, formatCurrency } from './types';
import { BreadcrumbItem } from '@/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import React from 'react';

// Laravel Paginator Structure
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Pagination<T> {
    data: T[];
    current_page: number;
    from: number;
    last_page: number;
    links: PaginationLink[];
    path: string;
    per_page: number;
    to: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    district: District;
    proccode: Proccode;
    items: Pagination<ConsolidationItem>;
}

export default function KonsolidasiDetail({ district, proccode, items }: Props) {
    // console.log('Detail Items:', items);
    const [selectedRawData, setSelectedRawData] = useState<any | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Konsolidasi Data', href: '/admin/konsolidasi' },
        { title: `${district.name} - ${proccode.name}`, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail ${district.name} - ${proccode.name}`} />

            <div className="flex-1 p-4 md:p-8 pt-6 space-y-6 max-w-3xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/admin/konsolidasi">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{district.name}</h2>
                        <p className="text-muted-foreground">
                            Detail Transaksi: {proccode.name}
                        </p>
                    </div>
                </div>

                <Card className="w-full max-w-6xl mx-auto">
                    <CardHeader>
                        <CardTitle>Daftar Transaksi</CardTitle>
                        <CardDescription>
                            Menampilkan {items.from} - {items.to} dari total {items.total} transaksi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 flex justify-end">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    if (confirm('Apakah Anda yakin ingin menghapus SEMUA data transaksi ini? Data yang dihapus tidak dapat dikembalikan.')) {
                                        router.delete('/admin/konsolidasi/reset', {
                                            data: {
                                                district_id: district.id,
                                                proccode_id: proccode.id
                                            }
                                        });
                                    }
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Data ({items.total})
                            </Button>
                        </div>

                        <div className="rounded-md border">
                            <table className="w-full text-sm">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="h-8 px-2 text-left font-medium w-[150px]">Tanggal</th>
                                        <th className="h-8 px-2 text-right font-medium">Nominal</th>
                                        <th className="h-8 px-2 text-center font-medium w-[100px]">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.data.length > 0 ? (
                                        items.data.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-2 text-sm">
                                                    {format(new Date(item.transaction_date), 'dd MMM yyyy', { locale: id })}
                                                </td>
                                                <td className="p-2 text-right font-mono text-sm">
                                                    {formatCurrency(item.nominal)}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={() => setSelectedRawData(item.raw_data)}
                                                        title="Lihat Detail"
                                                    >
                                                        <FileJson className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                                Tidak ada data.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-xs text-muted-foreground">
                                Showing {items.from} to {items.to} of {items.total} entries
                            </div>
                            <div className="flex items-center space-x-1">
                                {items.links.map((link, index) => {
                                    // Handle Previous/Next labels with HTML entities
                                    const label = link.label
                                        .replace('&laquo; Previous', 'Prev')
                                        .replace('Next &raquo;', 'Next');

                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-3 py-1 text-xs rounded-md border ${link.active
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-background hover:bg-muted text-foreground border-input'
                                                }`}
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: label }} />
                                        </Link>
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-xs rounded-md border border-input bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                                            dangerouslySetInnerHTML={{ __html: label }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Raw Data Modal */}
                <Dialog open={!!selectedRawData} onOpenChange={(open) => !open && setSelectedRawData(null)}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Raw Data Preview</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto bg-neutral-950 p-4 rounded-md mt-2">
                            <pre className="text-xs text-green-400 font-mono">
                                {JSON.stringify(selectedRawData, null, 2)}
                            </pre>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout >
    );
}
