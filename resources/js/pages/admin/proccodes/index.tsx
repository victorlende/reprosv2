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
    { title: 'Admin', href: '/admin/proccodes' },
    { title: 'Proccodes', href: '/admin/proccodes' },
];

interface Vendor {
    id: number;
    name: string;
}

interface Template {
    id: number;
    name: string;
    vendor: Vendor;
}

interface Proccode {
    id: number;
    code: string;
    name: string;
    description: string | null;
    source: string;
    category: string;
    template_id: number | null;
    template?: Template;
    is_active: boolean;
}

interface Props {
    proccodes: Proccode[];
}

function ProccodesIndex({ proccodes }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/proccodes/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Proccodes" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Proccodes</h1>
                        <p className="text-muted-foreground mt-1">Kelola data proccode dan mapping template</p>
                    </div>
                    <Link href="/admin/proccodes/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Proccode
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Proccode</CardTitle>
                        <CardDescription>
                            Total: {proccodes.length} proccode
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
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Source</TableHead>
                                        <TableHead>Template</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proccodes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                                Belum ada data proccode
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        proccodes.map((proccode, index) => (
                                            <TableRow key={proccode.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{proccode.name}</TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded">{proccode.code}</code>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge>{proccode.category}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{proccode.source}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {proccode.template ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium">{proccode.template.name}</div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {proccode.template.vendor.name}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {proccode.is_active ? (
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
                                                                    <Link href={`/admin/proccodes/${proccode.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Proccode</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setDeletingId(proccode.id)}
                                                                        disabled={deletingId === proccode.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Hapus Proccode</p>
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
                title="Hapus Proccode"
                description="Apakah Anda yakin ingin menghapus proccode ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </>
    );
}

ProccodesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default ProccodesIndex;
