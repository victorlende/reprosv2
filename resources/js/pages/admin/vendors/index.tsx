import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/vendors',
    },
    {
        title: 'Vendors',
        href: '/admin/vendors',
    },
];

interface Vendor {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
    templates_count: number;
}

interface Props {
    vendors: Vendor[];
}

function VendorsIndex({ vendors }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/vendors/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Vendors" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Vendors</h1>
                        <p className="text-muted-foreground mt-1">Kelola data vendor sistem</p>
                    </div>
                    <Link href="/admin/vendors/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Vendor
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Vendor</CardTitle>
                        <CardDescription>
                            Total: {vendors.length} vendor
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="text-center">Templates</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vendors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                Belum ada data vendor
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vendors.map((vendor, index) => (
                                            <TableRow key={vendor.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{vendor.name}</TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">{vendor.code}</code>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {vendor.description || '-'}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{vendor.templates_count}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {vendor.is_active ? (
                                                        <Badge variant="default">Aktif</Badge>
                                                    ) : (
                                                        <Badge variant="secondary">Nonaktif</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/admin/vendors/${vendor.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Vendor</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setDeletingId(vendor.id)}
                                                                        disabled={deletingId === vendor.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Hapus Vendor</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={() => deletingId && handleDelete(deletingId)}
                title="Hapus Vendor"
                description="Apakah Anda yakin ingin menghapus vendor ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </>
    );
}

VendorsIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default VendorsIndex;
