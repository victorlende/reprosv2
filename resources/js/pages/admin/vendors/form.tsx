import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    code: string;
    description: string | null;
    is_active: boolean;
}

interface Props {
    vendor: Vendor | null;
}

const getBreadcrumbs = (vendor: Vendor | null): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin/vendors',
    },
    {
        title: 'Vendors',
        href: '/admin/vendors',
    },
    {
        title: vendor ? 'Edit' : 'Tambah',
        href: vendor ? `/admin/vendors/${vendor.id}/edit` : '/admin/vendors/create',
    },
];

function VendorForm({ vendor }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: vendor?.name || '',
        code: vendor?.code || '',
        description: vendor?.description || '',
        is_active: vendor?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (vendor) {
            put(`/admin/vendors/${vendor.id}`);
        } else {
            post('/admin/vendors');
        }
    };

    return (
        <>
            <Head title={vendor ? 'Edit Vendor' : 'Tambah Vendor'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/vendors">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{vendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}</CardTitle>
                        <CardDescription>
                            {vendor ? 'Update data vendor' : 'Tambah vendor baru ke sistem'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Vendor *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Vendor A - Pajak Daerah"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Vendor *</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="vendor_a"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Code harus unik, gunakan format: vendor_a, vendor_b, dll
                                </p>
                                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi vendor..."
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Status Aktif</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Vendor aktif dapat digunakan untuk template
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Link href="/admin/vendors">
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

VendorForm.layout = (page: React.ReactElement<Props>) => (
    <AppLayout breadcrumbs={getBreadcrumbs(page.props.vendor)}>{page}</AppLayout>
);

export default VendorForm;
