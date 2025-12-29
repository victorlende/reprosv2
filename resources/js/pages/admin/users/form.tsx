import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Users', href: '/admin/users' },
    { title: 'User Form', href: '#' },
];

const AVAILABLE_MENUS = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'rekonsiliasi', label: 'Rekonsiliasi' },
    {
        id: 'admin', label: 'Admin Menu (Group)', children: [
            { id: 'admin.users', label: 'Manage Users' },
            { id: 'admin.vendors', label: 'Vendors' },
            { id: 'admin.templates', label: 'Templates' },
            { id: 'admin.proccodes', label: 'Proccodes' },
            { id: 'admin.receipt-templates', label: 'Receipt Templates' },
            { id: 'admin.logs', label: 'System Logs' },
        ]
    },
    { id: 'settings.system', label: 'System Settings' },
    {
        id: 'feature', label: 'Fitur Khusus', children: [
            { id: 'feature.print_receipt', label: 'Cetak Ulang Struk Pembayaran' },
        ]
    },
];

export default function UserForm({ user, districts = [] }: { user?: any, districts?: any[] }) {
    const { auth } = usePage<SharedData>().props;
    const isEditing = !!user;

    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role || 'viewer',
        district_id: user?.district_id || '',
        accessible_menus: user?.accessible_menus || [],
    });

    const isSuperUser = auth.user.role === 'super_user';

    const handleMenuChange = (menuId: string, checked: boolean) => {
        let newMenus = [...data.accessible_menus];
        if (checked) {
            if (!newMenus.includes(menuId)) {
                newMenus.push(menuId);
            }
        } else {
            newMenus = newMenus.filter(id => id !== menuId);
        }
        setData('accessible_menus', newMenus);
    };

    const isSelf = isEditing && user.id === auth.user.id;
    const isRoleDisabled = (!isSuperUser && data.role === 'super_user') || (isSelf && !isSuperUser);
    const isMenuDisabled = data.role === 'super_user' || (isSelf && !isSuperUser);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/admin/users/${user.id}`);
        } else {
            post('/admin/users');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${user.name}` : 'Create User'} />

            <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6 p-6 max-w-3xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit User' : 'Create User'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Update user details and permissions.' : 'Add new user to the system.'}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password {isEditing && '(Leave blank to keep)'}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required={!isEditing}
                                    />
                                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required={!isEditing}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Role & Permissions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={data.role}
                                    onValueChange={(val) => setData('role', val)}
                                    disabled={isRoleDisabled}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isSuperUser && <SelectItem value="super_user">Super User</SelectItem>}
                                        {isSuperUser && <SelectItem value="admin">Admin</SelectItem>}
                                        <SelectItem value="user_rekon">User Rekon</SelectItem>
                                        <SelectItem value="kantor_cabang">Kantor Cabang</SelectItem>
                                        <SelectItem value="viewer">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                                <p className="text-xs text-muted-foreground">
                                    {isSelf && !isSuperUser
                                        ? "Anda tidak dapat mengubah role anda sendiri."
                                        : (isSuperUser
                                            ? "Super User: Full Access. Admin: Manage Users. Rekon/Viewer: Restricted."
                                            : "Anda hanya dapat membuat User Rekon atau Viewer.")
                                    }
                                </p>
                            </div>

                            {data.role === 'kantor_cabang' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 bg-muted/50 p-4 rounded-md border border-dashed border-border">
                                    <Label htmlFor="district_id">Kantor Cabang / Kabupaten <span className="text-destructive">*</span></Label>
                                    <Select
                                        value={data.district_id ? String(data.district_id) : ""}
                                        onValueChange={(val) => setData('district_id', val)}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue placeholder="Pilih Kabupaten..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {districts.length > 0 ? (
                                                districts.map((d) => (
                                                    <SelectItem key={d.id} value={String(d.id)}>
                                                        {d.code} - {d.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-sm text-muted-foreground text-center">Data Kabupaten belum ada.</div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {(errors as any).district_id && <p className="text-sm text-destructive">{(errors as any).district_id}</p>}
                                    <p className="text-xs text-muted-foreground">User hanya akan melihat data terkait cabang ini.</p>
                                </div>
                            )}

                            {isSuperUser && (
                                <div className="space-y-3">
                                    <Label>Accessible Menus</Label>
                                    <div className="grid gap-2 border rounded-md p-4">
                                        {AVAILABLE_MENUS.map((menu) => (
                                            <div key={menu.id} className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={menu.id}
                                                        checked={data.accessible_menus.includes(menu.id)}
                                                        onCheckedChange={(checked) => handleMenuChange(menu.id, checked as boolean)}
                                                        disabled={data.role === 'super_user'} // Super User has all access usually
                                                    />
                                                    <Label htmlFor={menu.id}>{menu.label}</Label>
                                                </div>
                                                {menu.children && (
                                                    <div className="ml-6 grid gap-2">
                                                        {menu.children.map((child) => (
                                                            <div key={child.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={child.id}
                                                                    checked={data.accessible_menus.includes(child.id)}
                                                                    onCheckedChange={(checked) => handleMenuChange(child.id, checked as boolean)}
                                                                    disabled={data.role === 'super_user'}
                                                                />
                                                                <Label htmlFor={child.id}>{child.label}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {data.role === 'super_user' && (
                                        <p className="text-xs text-amber-600">Super Users have access to all menus by default.</p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/admin/users">
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? 'Save Changes' : 'Create User'}
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
