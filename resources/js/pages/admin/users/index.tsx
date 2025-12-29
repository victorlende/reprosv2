import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Plus, Search, Trash2, Shield, ShieldCheck, ShieldAlert, User as UserIcon, Monitor } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
];

export default function UserIndex({ users, filters }: { users: any, filters: any }) {
    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        setIsDeleting(true);
        router.delete(`/admin/users/${id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeletingId(null);
            },
        });
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_user':
                return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Super User</Badge>;
            case 'admin':
                return <Badge variant="default" className="gap-1 bg-indigo-600 hover:bg-indigo-700"><ShieldCheck className="h-3 w-3" /> Admin</Badge>;
            case 'user_rekon':
                return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> User Rekon</Badge>;
            default:
                return <Badge variant="outline" className="gap-1"><UserIcon className="h-3 w-3" /> Viewer</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">Kelola pengguna dan hak akses sistem</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/users/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Link>
                    </Button>
                </div>



                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div className="space-y-1">
                            <CardTitle>Daftar Pengguna</CardTitle>
                            <CardDescription>
                                Total: {users.data.length} user terdaftar
                            </CardDescription>
                        </div>
                        <div className="relative w-full md:max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari nama atau email..."
                                className="pl-8 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Asal / Cabang</TableHead>
                                        <TableHead>Akses Menu</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                                Tidak ada user ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.data.map((user: any) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{getRoleBadge(user.role)}</TableCell>
                                                <TableCell className="text-sm">
                                                    {user.district ? (
                                                        <span className="font-medium text-slate-700">
                                                            {user.district.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground italic">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                                                    {user.role === 'super_user' ? (
                                                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                                            <ShieldCheck className="h-3 w-3" /> All Access
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1">
                                                            <Monitor className="h-3 w-3" /> {user.accessible_menus?.length || 0} Menu Accessed
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Link href={`/admin/users/${user.id}/edit`}>
                                                                        <Button variant="outline" size="sm">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </Button>
                                                                    </Link>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Edit User</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>

                                                        {user.id !== auth.user.id && (
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => setDeletingId(user.id)}
                                                                            disabled={(auth.user.role !== 'super_user' && user.role === 'super_user') || deletingId === user.id}
                                                                        >
                                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Hapus User</p>
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
                    </CardContent>
                </Card>

                {users.links && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        {/* Pagination links logic could go here */}
                    </div>
                )}
            </div>

            <DeleteConfirmationDialog
                open={!!deletingId}
                onOpenChange={(open) => !open && setDeletingId(null)}
                onConfirm={() => deletingId && handleDelete(deletingId)}
                title="Hapus User"
                description="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
                loading={isDeleting}
            />
        </AppLayout>
    );
}
