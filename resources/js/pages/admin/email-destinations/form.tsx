import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';

interface Proccode {
    id: number;
    name: string;
    code: string;
}

interface EmailDestination {
    id: number;
    proccode_id: number | null;
    name: string;
    email: string;
    description: string | null;
    is_active: boolean;
}

interface Props {
    emailDestination: EmailDestination | null;
    proccodes: Proccode[];
}

const getBreadcrumbs = (emailDestination: EmailDestination | null): BreadcrumbItem[] => [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Email Tujuan',
        href: '/admin/email-destinations',
    },
    {
        title: emailDestination ? 'Edit' : 'Create',
        href: emailDestination ? `/admin/email-destinations/${emailDestination.id}/edit` : '/admin/email-destinations/create',
    },
];

function EmailDestinationForm({ emailDestination, proccodes }: Props) {
    const { data, setData, post, put, processing, errors } = useForm({
        proccode_id: emailDestination?.proccode_id?.toString() || 'all',
        name: emailDestination?.name || '',
        email: emailDestination?.email || '',
        description: emailDestination?.description || '',
        is_active: emailDestination?.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            ...data,
            proccode_id: data.proccode_id === 'all' ? null : parseInt(data.proccode_id),
        };

        if (emailDestination) {
            put(`/admin/email-destinations/${emailDestination.id}`, {
                data: submitData,
            });
        } else {
            post('/admin/email-destinations', {
                data: submitData,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(emailDestination)}>
            <Head title={emailDestination ? 'Edit Email Destination' : 'Create Email Destination'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/email-destinations">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>{emailDestination ? 'Edit Email Tujuan' : 'Tambah Email Tujuan Baru'}</CardTitle>
                        <CardDescription>
                            {emailDestination ? 'Update data email tujuan' : 'Tambah email tujuan baru untuk pengiriman rekonsiliasi'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Tujuan *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Kabupten Sumba Barat Daya"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Nama identifikasi tujuan email, misal: Sekolah Tunas Gloria, Kabupaten TTS.
                                </p>
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="rekonsiliasi@example.com"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alamat email tujuan pengiriman file rekonsiliasi.
                                </p>
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="proccode_id">Jenis Transaksi (Opsional)</Label>
                                <Select
                                    value={data.proccode_id}
                                    onValueChange={(value) => setData('proccode_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih jenis transaksi (opsional)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Jenis Transaksi</SelectItem>
                                        {proccodes.map((proccode) => (
                                            <SelectItem key={proccode.id} value={proccode.id.toString()}>
                                                {proccode.name} ({proccode.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Jika dipilih, email ini hanya akan muncul untuk jenis transaksi tersebut. Kosongkan untuk semua jenis transaksi.
                                </p>
                                {errors.proccode_id && <p className="text-sm text-destructive">{errors.proccode_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Catatan atau keterangan tambahan..."
                                    rows={3}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Informasi tambahan tentang email tujuan ini (opsional).
                                </p>
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Status Aktif</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Email tujuan hanya bisa dipilih jika aktif
                                    </p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </Button>
                                <Link href="/admin/email-destinations">
                                    <Button type="button" variant="outline" disabled={processing}>
                                        Batal
                                    </Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default EmailDestinationForm;
