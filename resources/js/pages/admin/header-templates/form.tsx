import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface ColumnDefinition {
    label: string;
    path: string; // Default path suggestion
    type: 'string' | 'currency' | 'date' | 'number';
}

interface HeaderTemplate {
    id: number;
    name: string;
    description: string | null;
    schema: ColumnDefinition[];
    is_active: boolean;
}

interface Props {
    template: HeaderTemplate | null;
}

const getBreadcrumbs = (template: HeaderTemplate | null): BreadcrumbItem[] => [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Header Templates', href: '/admin/header-templates' },
    { title: template ? 'Edit' : 'Buat Baru', href: template ? `/admin/header-templates/${template.id}/edit` : '/admin/header-templates/create' },
];

function HeaderTemplateForm({ template }: Props) {
    const [columns, setColumns] = useState<ColumnDefinition[]>(
        (template?.schema as ColumnDefinition[]) || [
            { label: 'trx_id', path: 'trx_id', type: 'string' },
            { label: 'nop', path: 'nop', type: 'string' },
            { label: 'nominal', path: 'nominal', type: 'currency' },
        ]
    );

    const { data, setData, put, post, processing, errors } = useForm({
        name: template?.name || '',
        description: template?.description || '',
        is_active: template?.is_active ?? true,
    });

    const addColumn = () => {
        setColumns([...columns, { label: '', path: '', type: 'string' }]);
    };

    const removeColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const updateColumn = (index: number, field: keyof ColumnDefinition, value: string) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: value };
        setColumns(newColumns);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (columns.length === 0) {
            alert('Minimal harus ada 1 kolom definisi');
            return;
        }

        const formData = {
            ...data,
            schema: columns,
        };

        if (template) {
            router.put(`/admin/header-templates/${template.id}`, formData);
        } else {
            router.post('/admin/header-templates', formData);
        }
    };

    return (
        <>
            <Head title={template ? 'Edit Header Template' : 'Buat Header Template'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/header-templates">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>{template ? 'Edit Template Header' : 'Buat Template Header Baru'}</CardTitle>
                                <CardDescription>
                                    Definisikan standar nama kolom (Header) yang bisa digunakan ulang di berbagai template mapping.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Template *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Standar Pembayaran PBB"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Deskripsi</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Deskripsi singkat..."
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            id="is_active"
                                        />
                                        <Label htmlFor="is_active">Aktif</Label>
                                    </div>

                                    {/* Column Definitions */}
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <Label className="text-base">Definisi Kolom Standar</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Tentukan nama kunci (Label) yang baku.
                                                </p>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tambah Kolom
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {columns.map((col, index) => (
                                                <div key={index} className="p-4 border rounded-lg flex gap-3 items-start bg-muted/20">
                                                    <div className="flex-1">
                                                        <Label className="text-xs">Label (Key Standar)</Label>
                                                        <Input
                                                            value={col.label}
                                                            onChange={(e) => updateColumn(index, 'label', e.target.value)}
                                                            placeholder="nop"
                                                            className="mt-1"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label className="text-xs">Tipe Data</Label>
                                                        <Select
                                                            value={col.type}
                                                            onValueChange={(val: any) => updateColumn(index, 'type', val)}
                                                        >
                                                            <SelectTrigger className="mt-1">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="string">String</SelectItem>
                                                                <SelectItem value="currency">Currency (Rp)</SelectItem>
                                                                <SelectItem value="date">Date</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="pt-6">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeColumn(index)}
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6">
                                        <Link href="/admin/header-templates">
                                            <Button type="button" variant="secondary">Batal</Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Menyimpan...' : 'Simpan Template'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Panduan</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-2 text-muted-foreground">
                                <p>
                                    Template Header digunakan untuk menstandarisasi nama kolom (Label) di seluruh sistem.
                                </p>
                                <p>
                                    Contoh penggunaan:
                                </p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Label <strong>nop</strong> untuk Nomor Objek Pajak.</li>
                                    <li>Label <strong>nominal</strong> untuk nilai pokok tagihan.</li>
                                    <li>Label <strong>denda</strong> untuk nilai denda.</li>
                                </ul>
                                <p className="mt-4">
                                    Saat membuat Template Mapping Vendor, Anda bisa "Load" template ini agar tidak perlu mengetik ulang nama-nama kolom tersebut.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

HeaderTemplateForm.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={getBreadcrumbs(null)}>{page}</AppLayout> // Breadcrumbs logic slightly broken in layout prop but fine for now
);

export default HeaderTemplateForm;
