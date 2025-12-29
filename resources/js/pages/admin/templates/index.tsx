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
    { title: 'Admin', href: '/admin/templates' },
    { title: 'Templates', href: '/admin/templates' },
];

interface Vendor {
    id: number;
    name: string;
}

interface Template {
    id: number;
    vendor_id: number;
    vendor: Vendor;
    category: string;
    name: string;
    description: string | null;
    is_active: boolean;
    proccodes_count: number;
}

interface Props {
    templates: Template[];
}

function TemplatesIndex({ templates }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/templates/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <>
            <Head title="Manage Templates" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Templates</h1>
                        <p className="text-muted-foreground mt-1">Kelola mapping template untuk setiap vendor</p>
                    </div>
                    <Link href="/admin/templates/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Template
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Template</CardTitle>
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
                                        <TableHead>Vendor</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead className="text-center">Proccodes</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {templates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                Belum ada data template
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        templates.map((template, index) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{template.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{template.vendor.name}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge>{template.category}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="secondary">{template.proccodes_count}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {template.is_active ? (
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
                                                                    <Link href={`/admin/templates/${template.id}/edit`}>
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
                                                                        onClick={() => setDeletingId(template.id)}
                                                                        disabled={deletingId === template.id}
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
                title="Hapus Template"
                description="Apakah Anda yakin ingin menghapus template ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </>
    );
}

TemplatesIndex.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);

export default TemplatesIndex;
