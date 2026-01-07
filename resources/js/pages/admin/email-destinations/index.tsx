import { useState } from 'react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Mail } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Email Tujuan',
        href: '/admin/email-destinations',
    },
];

interface Proccode {
    id: number;
    name: string;
    code: string;
}

interface EmailDestination {
    id: number;
    proccode_id: number | null;
    proccode?: Proccode;
    name: string;
    email: string;
    description: string | null;
    is_active: boolean;
}

interface Props {
    emailDestinations: EmailDestination[];
}

function EmailDestinationsIndex({ emailDestinations }: Props) {
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/email-destinations/${id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Email Destinations" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Email Tujuan</h1>
                        <p className="text-muted-foreground mt-1">Kelola daftar email tujuan untuk pengiriman rekonsiliasi.</p>
                    </div>
                    <Link href="/admin/email-destinations/create">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Email Tujuan
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Email Tujuan</CardTitle>
                        <CardDescription>
                            Total: {emailDestinations.length} email tujuan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Jenis Transaksi</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {emailDestinations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Mail className="h-8 w-8 opacity-20" />
                                                    <p>Belum ada data email tujuan</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        emailDestinations.map((destination, index) => (
                                            <TableRow key={destination.id}>
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{destination.name}</TableCell>
                                                <TableCell>
                                                    <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                                                        {destination.email}
                                                    </code>
                                                </TableCell>
                                                <TableCell>
                                                    {destination.proccode ? (
                                                        <Badge variant="outline">
                                                            {destination.proccode.name}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Semua</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {destination.description ? (
                                                        <span className="text-sm text-muted-foreground">
                                                            {destination.description.length > 50
                                                                ? destination.description.substring(0, 50) + '...'
                                                                : destination.description}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={destination.is_active ? 'default' : 'secondary'}>
                                                        {destination.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/admin/email-destinations/${destination.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit Email Tujuan</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setDeletingId(destination.id)}
                                                                        disabled={deletingId === destination.id}
                                                                        className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Hapus Email Tujuan</p>
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
                title="Hapus Email Tujuan"
                description="Apakah Anda yakin ingin menghapus email tujuan ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </AppLayout>
    );
}

export default EmailDestinationsIndex;
