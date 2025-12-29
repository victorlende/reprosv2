import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

interface District {
    id: number;
    name: string;
    code: string;
    branch_code: string | null;
}

interface Props {
    district: District | null;
}

const getBreadcrumbs = (district: District | null): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Districts',
        href: '/admin/districts',
    },
    {
        title: district ? 'Edit' : 'Create',
        href: district ? `/admin/districts/${district.id}/edit` : '/admin/districts/create',
    },
];

function DistrictForm({ district }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: district?.name || '',
        code: district?.code || '',
        branch_code: district?.branch_code || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (district) {
            put(`/admin/districts/${district.id}`);
        } else {
            post('/admin/districts');
        }
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(district)}>
            <Head title={district ? 'Edit District' : 'Create District'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/districts">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{district ? 'Edit Kabupaten' : 'Tambah Kabupaten Baru'}</CardTitle>
                        <CardDescription>
                            {district ? 'Update data kabupaten' : 'Tambah kabupaten baru ke sistem'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="code">Kode Kabupaten (Internal ID) *</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="MANGGARAI"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kode unik untuk identifikasi, misal: MANGGARAI, NGADA, KUPANG.
                                </p>
                                {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Kabupaten *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Kab. Manggarai"
                                    required
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="branch_code">Kode Cabang</Label>
                                <Input
                                    id="branch_code"
                                    type="text"
                                    value={data.branch_code}
                                    onChange={(e) => setData('branch_code', e.target.value)}
                                    placeholder="010"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Kode cabang 3 digit untuk filter data transaksi T24 (misal: 010). Kosongkan jika tidak ada.
                                </p>
                                {errors.branch_code && <p className="text-sm text-destructive">{errors.branch_code}</p>}
                            </div>

                            <div className="flex gap-3 justify-end pt-4">
                                <Link href="/admin/districts">
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
        </AppLayout>
    );
}

export default DistrictForm;
