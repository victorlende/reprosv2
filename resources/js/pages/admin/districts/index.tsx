import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2, Plus, Building2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Districts',
        href: '/admin/districts',
    },
];

interface District {
    id: number;
    name: string;
    code: string;
    branch_code: string | null;
}

interface Props {
    districts: District[];
}

function DistrictsIndex({ districts }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/districts/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Districts" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Kabupaten</h1>
                        <p className="text-muted-foreground mt-1">Kelola data wilayah kantor cabang.</p>
                    </div>
                    <Link href="/admin/districts/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Kabupaten
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kabupaten</CardTitle>
                        <CardDescription>
                            Total: {districts.length} kabupaten
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama Kabupaten</TableHead>
                                        <TableHead>Branch Code (T24)</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {districts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Building2 className="h-8 w-8 opacity-20" />
                                                    <p>Belum ada data kabupaten</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        districts.map((district, index) => (
                                            <TableRow key={district.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{district.code}</code>
                                                </TableCell>
                                                <TableCell className="font-medium">{district.name}</TableCell>
                                                <TableCell>
                                                    {district.branch_code ? (
                                                        <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">{district.branch_code}</code>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Not set</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/admin/districts/${district.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Kabupaten</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setDeletingId(district.id)}
                                                                        disabled={deletingId === district.id}
                                                                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Hapus Kabupaten</p>
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
                title="Hapus Kabupaten"
                description="Apakah Anda yakin ingin menghapus kabupaten ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </AppLayout>
    );
}

export default DistrictsIndex;
