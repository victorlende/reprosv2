import { useState, useMemo } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, ArrowLeft, ReceiptText, Printer } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ReceiptPreview } from '@/components/receipt-preview';

interface ReceiptTemplate {
    id?: number;
    name: string;
    description: string | null;
    config: ReceiptConfig;
    is_active: boolean;
}

interface ReceiptConfig {
    header: {
        title: string;
        subtitle: string;
        address: string;
        logo_left?: string | null;
        logo_right?: string | null;
    };
    body: ReceiptField[];
    footer: {
        text: string;
    };
}

interface ReceiptField {
    label: string;
    path: string;
    type: 'text' | 'currency' | 'date' | 'separator' | 'terbilang';
    align: 'left' | 'center' | 'right' | 'between';
    style: 'normal' | 'bold' | 'large';
}

interface Props {
    template?: ReceiptTemplate;
    tableTemplates?: { id: number; name: string }[];
}


export default function ReceiptTemplateForm({ template, tableTemplates = [] }: Props) {
    const isEditing = !!template;

    // Initial State for Config
    const initialConfig: ReceiptConfig = template?.config || {
        header: {
            title: 'PEMERINTAH KABUPATEN',
            subtitle: 'BADAN PENDAPATAN DAERAH',
            address: 'Jl. Contoh No. 123, Kota X',
            logo_left: null,
            logo_right: null,
        },
        body: [
            { label: 'Tanggal', path: 'tanggal', type: 'date', align: 'between', style: 'normal' },
            { label: 'No. Transaksi', path: 'ntb', type: 'text', align: 'between', style: 'normal' },
            { label: '--------------------------------', path: '', type: 'separator', align: 'center', style: 'normal' },
            { label: 'Nominal', path: 'nominal', type: 'currency', align: 'between', style: 'bold' },
        ],
        footer: {
            text: 'Terima Kasih\nHarap simpan bukti ini.',
        },
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: isEditing ? 'PUT' : 'POST',
        name: template?.name || '',
        description: template?.description || '',
        config: initialConfig,
        is_active: template?.is_active ?? true,
        logo_left: null as File | null,
        logo_right: null as File | null,
    });

    // Sample Data State for Preview
    const [sampleData, setSampleData] = useState<any>({
        tanggal: '2024-12-21 10:00:00',
        ntb: 'TRX123456789',
        nop: '32.01.010.001.000-0000.0',
        nama_wp: 'BUDI SANTOSO',
        nominal: 500000,
        denda: 0,
        total: 500000,
        kabupaten_name: 'KUPANG',
        alamat_uptd: 'Jl. Frans Seda No. 12',
    });
    const [sampleLoading, setSampleLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading files, we must use POST.
        // If editing, we simulate PUT using _method field.
        if (isEditing) {
            post(`/admin/receipt-templates/${template.id}`);
        } else {
            post('/admin/receipt-templates');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            // Update the form data for upload
            setData(position === 'left' ? 'logo_left' : 'logo_right', file);

            // Update local preview
            const previewUrl = URL.createObjectURL(file);
            setData('config', {
                ...data.config,
                header: {
                    ...data.config.header,
                    [position === 'left' ? 'logo_left' : 'logo_right']: previewUrl
                }
            });
        }
    };

    // Helper to format values
    const formatValue = (value: any, type: string) => {
        if (!value) return '-';
        if (type === 'currency') {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value));
        }
        if (type === 'date') {
            // Simple date format
            return String(value);
        }
        return String(value);
    };

    // Helper to get value from path
    const getValue = (obj: any, path: string) => {
        if (!path) return '';
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
    };

    const addBodyField = () => {
        setData('config', {
            ...data.config,
            body: [
                ...data.config.body,
                { label: 'New Field', path: '', type: 'text', align: 'between', style: 'normal' }
            ]
        });
    };

    const removeBodyField = (index: number) => {
        const newBody = [...data.config.body];
        newBody.splice(index, 1);
        setData('config', {
            ...data.config,
            body: newBody
        });
    };

    const updateBodyField = (index: number, field: string, value: string) => {
        const newBody = [...data.config.body];
        newBody[index] = { ...newBody[index], [field]: value };
        setData('config', {
            ...data.config,
            body: newBody
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Receipt Templates', href: '/admin/receipt-templates' },
        { title: isEditing ? 'Edit Template' : 'Buat Template', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Edit ${template.name}` : 'Buat Receipt Template'} />

            <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            {isEditing ? 'Edit Receipt Template' : 'Buat Receipt Template'}
                        </h1>
                        <p className="text-muted-foreground">
                            Konfigurasi tata letak struk bukti pembayaran.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/receipt-templates">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing} size="sm">
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Make Change
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* LEFT COLUMN: Configuration */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Dasar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Template</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: Struk Thermal Pajak Daerah"
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
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                    <Label htmlFor="is_active">Status Aktif</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Konfigurasi Header</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Judul Utama / Instansi</Label>
                                    <Input
                                        value={data.config.header.title}
                                        onChange={(e) => setData('config', { ...data.config, header: { ...data.config.header, title: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Sub Judul / Unit Kerja</Label>
                                    <Input
                                        value={data.config.header.subtitle}
                                        onChange={(e) => setData('config', { ...data.config, header: { ...data.config.header, subtitle: e.target.value } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alamat</Label>
                                    <Textarea
                                        rows={2}
                                        value={data.config.header.address}
                                        onChange={(e) => setData('config', { ...data.config, header: { ...data.config.header, address: e.target.value } })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Gunakan <code>{`{nama_field}`}</code> untuk mengambil data dinamis. Contoh: <code>{`{kabupaten_name}`}</code>, <code>{`{alamat_uptd}`}</code>. Gunakan <code>{`{terbilang}`}</code> untuk menampilkan terbilang dari total.
                                    </p>
                                </div>

                                <Separator className="my-2" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Logo Kiri</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'left')}
                                        />
                                        <p className="text-xs text-muted-foreground">Upload gambar untuk logo kiri.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Logo Kanan</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'right')}
                                        />
                                        <p className="text-xs text-muted-foreground">Upload gambar untuk logo kanan.</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Mapping Body Data</CardTitle>
                                <Button type="button" variant="outline" size="sm" onClick={addBodyField}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Tambah Field
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.config.body.map((field, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-2 items-end border-b pb-4">
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                value={field.label}
                                                onChange={(e) => updateBodyField(index, 'label', e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">JSON Path</Label>
                                            <Input
                                                value={field.path}
                                                onChange={(e) => updateBodyField(index, 'path', e.target.value)}
                                                className="h-8 text-sm font-mono"
                                                placeholder="data.x"
                                                disabled={field.type === 'separator'}
                                            />
                                        </div>
                                        <div className="col-span-2 space-y-1">
                                            <Label className="text-xs">Align</Label>
                                            <Select value={field.align} onValueChange={(val) => updateBodyField(index, 'align', val)}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">Left</SelectItem>
                                                    <SelectItem value="center">Center</SelectItem>
                                                    <SelectItem value="right">Right</SelectItem>
                                                    <SelectItem value="between">Between</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-3 space-y-1">
                                            <Label className="text-xs">Type</Label>
                                            <Select value={field.type} onValueChange={(val) => updateBodyField(index, 'type', val)}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Text</SelectItem>
                                                    <SelectItem value="currency">Currency</SelectItem>
                                                    <SelectItem value="date">Date</SelectItem>
                                                    <SelectItem value="separator">Separator</SelectItem>
                                                    <SelectItem value="terbilang">Terbilang</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-1">
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeBodyField(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Konfigurasi Footer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label>Teks Footer</Label>
                                    <Textarea
                                        rows={3}
                                        value={data.config.footer.text}
                                        onChange={(e) => setData('config', { ...data.config, footer: { ...data.config.footer, text: e.target.value } })}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Support placeholder: <code>{`{terbilang}`}</code> (untuk total), atau <code>{`{terbilang:path_lain}`}</code>.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Preview */}
                    <div className="lg:sticky lg:top-6 space-y-6 h-fit">
                        <Card className="border-2 border-dashed">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Printer className="h-5 w-5" />
                                    Live Preview (A4)
                                </CardTitle>
                                <CardDescription>
                                    Pratinjau tampilan struk dengan data simulasi.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex justify-center bg-gray-100 p-8 dark:bg-gray-900 rounded-b-xl">
                                <ReceiptPreview config={data.config} data={sampleData} />
                            </CardContent>
                        </Card>

                        <div className="text-sm text-muted-foreground">
                            <strong>Note:</strong> Data preview di atas adalah data statis (dummy). Saat implementasi nyata, data akan diambil dari hasil query transaksi.
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
