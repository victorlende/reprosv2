import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus } from 'lucide-react';

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
}

interface ReceiptTemplate {
    id: number;
    name: string;
}

interface Proccode {
    id: number;
    code: string;
    name: string;
    description: string | null;
    source: string;
    category: string;
    template_id: number | null;
    receipt_template_id: number | null;
    is_active: boolean;
    receipt_config?: {
        title?: string;
        subtitle?: string;
        address?: string;
        logo_left?: string | null;
        logo_right?: string | null;
    };
    district_id: number | null;
}

interface Props {
    proccode: Proccode | null;
    templates: Template[];
    receiptTemplates: ReceiptTemplate[];
    categories: string[];
    districts?: any[];
}

const getBreadcrumbs = (proccode: Proccode | null): BreadcrumbItem[] => [
    { title: 'Admin', href: '/admin/proccodes' },
    { title: 'Proccodes', href: '/admin/proccodes' },
    { title: proccode ? 'Edit' : 'Tambah', href: proccode ? `/admin/proccodes/${proccode.id}/edit` : '/admin/proccodes/create' },
];

function ProccodeForm({ proccode, templates, receiptTemplates, categories, districts = [] }: Props) {
    const [logoLeftPreview, setLogoLeftPreview] = useState<string | null>(proccode?.receipt_config?.logo_left || null);
    const [logoRightPreview, setLogoRightPreview] = useState<string | null>(proccode?.receipt_config?.logo_right || null);
    const [localCategories, setLocalCategories] = useState<string[]>(categories);
    const [newCategoryOpen, setNewCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const { data, setData, post, processing, errors, transform } = useForm({
        _method: proccode ? 'PUT' : 'POST',
        code: proccode?.code || '',
        name: proccode?.name || '',
        description: proccode?.description || '',
        source: proccode?.source || '',
        category: proccode?.category || '',
        template_id: proccode?.template_id?.toString() || 'null',
        receipt_template_id: proccode?.receipt_template_id?.toString() || 'null',
        district_id: proccode?.district_id?.toString() || 'null',
        is_active: proccode?.is_active ?? true,
        // Receipt Header Config
        receipt_header_title: proccode?.receipt_config?.title || '',
        receipt_header_subtitle: proccode?.receipt_config?.subtitle || '',
        receipt_header_address: proccode?.receipt_config?.address || '',
        logo_left: null as File | null,
        logo_right: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, position: 'left' | 'right') => {
        const file = e.target.files?.[0];
        if (file) {
            setData(position === 'left' ? 'logo_left' : 'logo_right', file);
            const previewUrl = URL.createObjectURL(file);
            if (position === 'left') setLogoLeftPreview(previewUrl);
            else setLogoRightPreview(previewUrl);
        }
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;

        // Add to local list if not exists
        if (!localCategories.includes(newCategoryName)) {
            setLocalCategories([...localCategories, newCategoryName].sort());
        }

        // Set as selected value
        setData('category', newCategoryName);

        // Reset and close
        setNewCategoryName('');
        setNewCategoryOpen(false);
    };

    useEffect(() => {
        transform((data) => ({
            ...data,
            template_id: data.template_id === 'null' ? null : data.template_id,
            receipt_template_id: data.receipt_template_id === 'null' ? null : data.receipt_template_id,
            district_id: data.district_id === 'null' ? null : data.district_id,
        }));
    }, [transform]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (proccode) {
            post(`/admin/proccodes/${proccode.id}`);
        } else {
            post('/admin/proccodes');
        }
    };

    return (
        <>
            <Head title={proccode ? 'Edit Proccode' : 'Tambah Proccode'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/proccodes">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{proccode ? 'Edit Proccode' : 'Tambah Proccode Baru'}</CardTitle>
                                <CardDescription>
                                    {proccode ? 'Update data proccode' : 'Tambah proccode baru dan pilih template mapping'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form id="proccode-form" onSubmit={submit} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="code">Proccode *</Label>
                                        <Input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            placeholder="180V99,180G99"
                                            required
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Format: kode1,kode2 (dipisah koma jika lebih dari 1)
                                        </p>
                                        {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Produk *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="PBB - Kabupaten Ende"
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
                                            placeholder="Pajak Bumi dan Bangunan Kabupaten Ende"
                                            rows={2}
                                        />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="source">Source *</Label>
                                            <Input
                                                id="source"
                                                type="text"
                                                value={data.source}
                                                onChange={(e) => setData('source', e.target.value)}
                                                placeholder="psw1"
                                                required
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Contoh: psw1, pswsrv, dll
                                            </p>
                                            {errors.source && <p className="text-sm text-destructive">{errors.source}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="category">Kategori *</Label>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <Select
                                                        value={data.category}
                                                        onValueChange={(value) => setData('category', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih / tambah" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {localCategories.map((cat) => (
                                                                <SelectItem key={cat} value={cat}>
                                                                    {cat}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <Dialog open={newCategoryOpen} onOpenChange={setNewCategoryOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline" size="icon" title="Tambah Kategori Baru">
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-md">
                                                        <DialogHeader>
                                                            <DialogTitle>Tambah Kategori Baru</DialogTitle>
                                                            <DialogDescription>
                                                                Masukkan nama kategori baru untuk proccode ini.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="new-category">Nama Kategori</Label>
                                                                <Input
                                                                    id="new-category"
                                                                    value={newCategoryName}
                                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                                    placeholder="Contoh: Pajak Daerah"
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button type="button" variant="secondary" onClick={() => setNewCategoryOpen(false)}>
                                                                Batal
                                                            </Button>
                                                            <Button type="button" onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                                                                Tambah
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="template_id">Template Mapping</Label>
                                        <Select
                                            value={data.template_id}
                                            onValueChange={(value) => setData('template_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih template (opsional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">Tidak ada template</SelectItem>
                                                {templates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id.toString()}>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{template.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {template.vendor.name} - {template.category}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Template menentukan bagaimana data akan ditampilkan di tabel
                                        </p>
                                        {errors.template_id && <p className="text-sm text-destructive">{errors.template_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="receipt_template_id">Receipt Template</Label>
                                        <Select
                                            value={data.receipt_template_id}
                                            onValueChange={(value) => setData('receipt_template_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih template struk (opsional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">Tidak ada template struk</SelectItem>
                                                {receiptTemplates.map((rt) => (
                                                    <SelectItem key={rt.id} value={rt.id.toString()}>
                                                        {rt.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Template menentukan layout dasar struk (Body & Footer)
                                        </p>
                                        {errors.receipt_template_id && <p className="text-sm text-destructive">{errors.receipt_template_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="district_id">Kabupaten / Cabang (Districts)</Label>
                                        <Select
                                            value={data.district_id}
                                            onValueChange={(value) => setData('district_id', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih kabupaten (opsional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="null">Umum / Semua Cabang (Global)</SelectItem>
                                                {districts.map((d) => (
                                                    <SelectItem key={d.id} value={d.id.toString()}>
                                                        {d.code} - {d.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            Jika dipilih, proccode ini HANYA akan terlihat oleh user dari cabang tersebut.
                                        </p>
                                        {(errors as any).district_id && <p className="text-sm text-destructive">{(errors as any).district_id}</p>}
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Status Aktif</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Proccode aktif akan muncul di dropdown rekonsiliasi
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </form>
                            </CardContent>
                            <CardHeader className="pt-0 pb-6 px-6">
                                <div className="flex justify-end gap-3">
                                    <Link href="/admin/proccodes">
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" form="proccode-form" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                </div>
                            </CardHeader>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Konfigurasi Header Struk</CardTitle>
                                <CardDescription>
                                    Tentukan Judul, Alamat, dan Logo khusus untuk Proccode ini. Data ini akan menimpa header default template.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Judul Instansi (Header Title)</Label>
                                    <Input
                                        value={data.receipt_header_title}
                                        onChange={(e) => setData('receipt_header_title', e.target.value)}
                                        placeholder="PEMERINTAH KABUPATEN ..."
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Gunakan <code>{`{nama_field}`}</code> untuk data dinamis.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Sub Judul / Unit (Header Subtitle)</Label>
                                    <Input
                                        value={data.receipt_header_subtitle}
                                        onChange={(e) => setData('receipt_header_subtitle', e.target.value)}
                                        placeholder="BADAN PENDAPATAN DAERAH"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Alamat</Label>
                                    <Textarea
                                        rows={2}
                                        value={data.receipt_header_address}
                                        onChange={(e) => setData('receipt_header_address', e.target.value)}
                                        placeholder="Jl. Raya No. 1..."
                                    />
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Logo Kiri</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'left')}
                                        />
                                        {logoLeftPreview && (
                                            <div className="mt-2 h-20 w-full border rounded flex items-center justify-center p-2 bg-slate-50">
                                                <img src={logoLeftPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Logo Kanan</Label>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, 'right')}
                                        />
                                        {logoRightPreview && (
                                            <div className="mt-2 h-20 w-full border rounded flex items-center justify-center p-2 bg-slate-50">
                                                <img src={logoRightPreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

ProccodeForm.layout = (page: React.ReactElement<Props>) => (
    <AppLayout breadcrumbs={getBreadcrumbs(page.props.proccode)}>{page}</AppLayout>
);

export default ProccodeForm;
