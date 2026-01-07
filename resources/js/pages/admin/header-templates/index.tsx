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
import { Pencil, Trash2, Plus, LayoutTemplate } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Header Templates', href: '/admin/header-templates' },
];

interface HeaderTemplate {
    id: number;
    name: string;
    description: string;
    schema: any;
    is_active: boolean;
}

interface Props {
    templates: HeaderTemplate[];
}

function HeaderTemplatesIndex({ templates }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/header-templates/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Header Templates" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Header Templates</h1>
                        <p className="text-muted-foreground mt-1">
                            Kelola template standar untuk header kolom (Reusable)
                        </p>
                    </div>
                    <Link href="/admin/header-templates/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Buat Template Baru
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Template Header</CardTitle>
                        <CardDescription>
                            Total: {templates.length} template
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama Template</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Jumlah Kolom</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                Belum ada template header
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        templates.map((tpl, index) => (
                                            <TableRow key={tpl.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">

                                                        {tpl.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{tpl.description || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {(Array.isArray(tpl.schema) ? tpl.schema : []).length} Kolom
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {tpl.is_active ? (
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
                                                                    <Link href={`/admin/header-templates/${tpl.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Template</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setDeletingId(tpl.id)}
                                                                        disabled={deletingId === tpl.id}
                                                                    >
                                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Hapus Template</p>
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
                title="Hapus Template Header"
                description="Apakah Anda yakin ingin menghapus template ini? Template yang sudah digunakan di mapping lain tidak akan merusak mapping tersebut (karena data di-copy), tapi template ini akan hilang dari daftar."
                loading={isDeleting}
            />
        </>
    );
}

HeaderTemplatesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default HeaderTemplatesIndex;
