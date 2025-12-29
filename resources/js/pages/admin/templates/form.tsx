import { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { StringParserHelper } from '@/components/string-parser-helper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Plus, Trash2, Search, Loader2, Copy, CheckCircle2, Maximize2, X, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Vendor {
    id: number;
    name: string;
}

interface Processor {
    name: string;
    class: string;
    is_generic: boolean;
}

interface ColumnMapping {
    label: string;
    path: string;
    type: 'string' | 'currency' | 'date' | 'number';
    substring_start?: number;
    substring_length?: number;
}

interface Template {
    id: number;
    vendor_id: number;
    category: string;
    name: string;
    mapping: {
        table_columns: ColumnMapping[];
    };
    description: string | null;
    valid_response_codes: string | null;
    processor_class: string | null;
    is_active: boolean;
}

interface Props {
    template: Template | null;
    vendors: Vendor[];
    categories: string[];
    availableProcessors: Processor[];
    proccodes: { code: string; name: string; source: string }[];
}

const getBreadcrumbs = (template: Template | null): BreadcrumbItem[] => [
    { title: 'Admin', href: '/admin/templates' },
    { title: 'Templates', href: '/admin/templates' },
    { title: template ? 'Edit' : 'Tambah', href: template ? `/admin/templates/${template.id}/edit` : '/admin/templates/create' },
];

function TemplateForm({ template, vendors, categories, availableProcessors, proccodes }: Props) {
    const [columns, setColumns] = useState<ColumnMapping[]>(
        template?.mapping?.table_columns || [
            { label: '', path: '', type: 'string' }
        ]
    );

    const [newCategoryOpen, setNewCategoryOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [localCategories, setLocalCategories] = useState<string[]>(categories);

    // Fetch states
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchProccode, setFetchProccode] = useState('');
    const [fetchSource, setFetchSource] = useState('PSW');
    const [fetchDate, setFetchDate] = useState<Date | undefined>(new Date());
    const [fetchedData, setFetchedData] = useState<any>(null);
    const [jsonPreviewOpen, setJsonPreviewOpen] = useState(false);



    // Processor Editor State
    const [editorOpen, setEditorOpen] = useState(false);
    const [editorContent, setEditorContent] = useState('');
    const [editorLoading, setEditorLoading] = useState(false);
    const [createProcessorOpen, setCreateProcessorOpen] = useState(false);
    const [newProcessorName, setNewProcessorName] = useState('');
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleEditProcessor = async () => {
        if (!data.processor_class) return;

        setEditorLoading(true);
        setEditorOpen(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/admin/templates/processor/get', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ class_name: data.processor_class }),
            });
            const result = await response.json();
            if (result.success) {
                setEditorContent(result.content);
            } else {
                alert('Gagal mengambil content: ' + result.message);
                setEditorOpen(false);
            }
        } catch (e) {
            alert('Terjadi kesalahan network');
            setEditorOpen(false);
        } finally {
            setEditorLoading(false);
        }
    };

    const handleSaveProcessor = async () => {
        setEditorLoading(true);
        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/admin/templates/processor/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    class_name: data.processor_class,
                    content: editorContent
                }),
            });
            const result = await response.json();
            if (result.success) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2000);
            } else {
                alert('Gagal menyimpan: ' + result.message);
            }
        } catch (e) {
            alert('Terjadi kesalahan network');
        } finally {
            setEditorLoading(false);
        }
    };

    const handleCreateProcessor = async () => {
        if (!newProcessorName.trim()) return;

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
            const response = await fetch('/admin/templates/processor/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({ name: newProcessorName }),
            });
            const result = await response.json();

            if (result.success) {
                // alert('Processor berhasil dibuat!'); // Removed as per request
                setCreateProcessorOpen(false);
                setNewProcessorName('');

                // Add to available processors list
                router.reload({ only: ['availableProcessors'] });

                // Set the new processor as selected
                setData('processor_class', result.class);

                // Auto open the editor for the new processor
                setEditorOpen(true);
                setEditorLoading(true);

                try {
                    const getResponse = await fetch('/admin/templates/processor/get', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken || '',
                        },
                        body: JSON.stringify({ class_name: result.class }),
                    });
                    const getResult = await getResponse.json();
                    if (getResult.success) {
                        setEditorContent(getResult.content);
                    } else {
                        alert('Gagal mengambil content: ' + getResult.message);
                    }
                } catch (e) {
                    alert('Terjadi kesalahan saat mengambil content');
                } finally {
                    setEditorLoading(false);
                }

            } else {
                alert('Gagal: ' + result.message);
            }
        } catch (e) {
            alert('Terjadi kesalahan network');
        }
    };

    const handleFetchSample = async () => {
        if (!fetchProccode || !fetchDate) {
            alert('Proccode dan Tanggal harus diisi');
            return;
        }

        setFetchLoading(true);
        setFetchedData(null);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;

            const response = await fetch('/admin/templates/fetch-sample', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    proccode: fetchProccode,
                    source: fetchSource,
                    tanggal: format(fetchDate as Date, "yyyy-MM-dd")
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal mengambil data');
            }

            if (result.success) {
                setFetchedData(result.data);
            } else {
                alert(result.message || 'Data tidak ditemukan');
            }

        } catch (error) {
            alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
        } finally {
            setFetchLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Disalin ke clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text: string) => {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            alert('Disalin ke clipboard!');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            alert('Gagal menyalin ke clipboard. Browser tidak support.');
        }
        document.body.removeChild(textArea);
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

    const { data, setData, post, put, processing, errors } = useForm({
        vendor_id: template?.vendor_id?.toString() || '',
        category: template?.category || '',
        name: template?.name || '',
        mapping: '',

        description: template?.description || '',
        valid_response_codes: template?.valid_response_codes || '',
        processor_class: template?.processor_class || '',
        is_active: template?.is_active ?? true,
    });

    const addColumn = () => {
        setColumns([...columns, { label: '', path: '', type: 'string' }]);
    };

    const removeColumn = (index: number) => {
        setColumns(columns.filter((_, i) => i !== index));
    };

    const updateColumn = (index: number, field: keyof ColumnMapping, value: string | number) => {
        const newColumns = [...columns];
        newColumns[index] = { ...newColumns[index], [field]: value };
        setColumns(newColumns);
    };




    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validate columns
        const validColumns = columns.filter(col => col.label && col.path);
        if (validColumns.length === 0) {
            alert('Minimal harus ada 1 kolom yang valid');
            return;
        }

        // Build mapping JSON
        const mappingJson = JSON.stringify({
            table_columns: validColumns
        });

        // Prepare form data
        const formData = {
            vendor_id: data.vendor_id,
            category: data.category,
            name: data.name,
            mapping: mappingJson,
            description: data.description,
            valid_response_codes: data.valid_response_codes,
            processor_class: data.processor_class,
            is_active: data.is_active,
        };

        if (template) {
            router.put(`/admin/templates/${template.id}`, formData, {
                preserveScroll: true,
                onSuccess: () => {
                    router.visit('/admin/templates');
                }
            });
        } else {
            router.post('/admin/templates', formData, {
                onSuccess: () => {
                    router.visit('/admin/templates');
                }
            });
        }
    };

    return (
        <>
            <Head title={template ? 'Edit Template' : 'Tambah Template'} />

            <div className="p-6">
                <div className="mb-6">
                    <Link href="/admin/templates">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Form (7 col) */}
                    <div className="lg:col-span-7">
                        <Card>
                            <CardHeader>
                                <CardTitle>{template ? 'Edit Template' : 'Tambah Template Baru'}</CardTitle>
                                <CardDescription>
                                    {template ? 'Update mapping template' : 'Buat mapping template baru untuk vendor'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={submit} className="space-y-6">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="vendor_id">Vendor *</Label>
                                            <Select
                                                value={data.vendor_id}
                                                onValueChange={(value) => setData('vendor_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih vendor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {vendors.map((vendor) => (
                                                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                                            {vendor.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.vendor_id && <p className="text-sm text-destructive">{errors.vendor_id}</p>}
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
                                                            <SelectValue placeholder="Pilih atau tambah kategori" />
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
                                                                Masukkan nama kategori baru untuk template ini.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label htmlFor="new-category">Nama Kategori</Label>
                                                                <Input
                                                                    id="new-category"
                                                                    value={newCategoryName}
                                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                                    placeholder="Contoh: Retribusi"
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
                                        <Label htmlFor="name">Nama Template *</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Template PBB Vendor A"
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
                                            placeholder="Deskripsi template..."
                                            rows={2}
                                        />

                                    </div>



                                    <div className="space-y-4 rounded-lg border p-4 bg-muted/50">
                                        <div className="space-y-2">
                                            <Label className="flex items-center space-x-6">Mode Parsing Data</Label>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="mode_default"
                                                        name="parsing_mode"
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={!data.processor_class || data.processor_class === 'App\\Services\\Rekonsiliasi\\Processors\\GenericProcessor'}
                                                        onChange={() => setData('processor_class', '')}
                                                    />
                                                    <Label htmlFor="mode_default" className="font-normal cursor-pointer">
                                                        Default (JSON Standard)
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="radio"
                                                        id="mode_custom"
                                                        name="parsing_mode"
                                                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        checked={!!data.processor_class && data.processor_class !== 'App\\Services\\Rekonsiliasi\\Processors\\GenericProcessor'}
                                                        onChange={() => {
                                                            // Auto select first non-generic processor if available, or keep empty
                                                            if (!data.processor_class) {
                                                                const firstCustom = availableProcessors.find(p => !p.is_generic);
                                                                if (firstCustom) setData('processor_class', firstCustom.class);
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor="mode_custom" className="font-normal cursor-pointer">
                                                        Custom
                                                    </Label>
                                                </div>
                                            </div>
                                        </div>



                                        {!!data.processor_class && data.processor_class !== 'App\\Services\\Rekonsiliasi\\Processors\\GenericProcessor' && (
                                            <div className="pl-6 border-l-2 border-blue-200 ml-1 space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
                                                <div className="space-y-2">
                                                    <Label htmlFor="processor_class">Pilih Processor Class</Label>
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <Select
                                                                value={data.processor_class}
                                                                onValueChange={(value) => setData('processor_class', value)}
                                                            >
                                                                <SelectTrigger className="font-mono text-xs bg-white">
                                                                    <SelectValue placeholder="Pilih Custom Processor" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {availableProcessors.filter(p => !p.is_generic).map((proc) => (
                                                                        <SelectItem key={proc.class} value={proc.class} className="font-mono text-xs">
                                                                            {proc.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <Button type="button" variant="outline" size="sm" onClick={handleEditProcessor} title="Edit Code">
                                                            Edit Code
                                                        </Button>

                                                        <Dialog open={createProcessorOpen} onOpenChange={setCreateProcessorOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button type="button" variant="secondary" size="sm" title="Buat Processor Baru">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Buat Processor Baru</DialogTitle>
                                                                    <DialogDescription>
                                                                        Masukkan nama untuk class processor baru Anda.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="grid gap-4 py-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="new-proc-name">Nama Class</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-xs text-muted-foreground font-mono">...Processors\</span>
                                                                            <Input
                                                                                id="new-proc-name"
                                                                                value={newProcessorName}
                                                                                onChange={(e) => setNewProcessorName(e.target.value)}
                                                                                placeholder="Contoh: MyNewBank"
                                                                            />
                                                                            <span className="text-xs text-muted-foreground font-mono">Processor.php</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button type="button" variant="outline" onClick={() => setCreateProcessorOpen(false)}>Batal</Button>
                                                                    <Button type="button" onClick={handleCreateProcessor} disabled={!newProcessorName.trim()}>Buat</Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>

                                                    <p className="text-[10px] text-muted-foreground">
                                                        Logic parsing akan ditangani oleh: <code>{data.processor_class ? data.processor_class.split('\\').pop() + '.php' : '...'}</code>
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Editor Modal */}
                                    <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                                        <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-6">
                                            <DialogHeader>
                                                <DialogTitle className="font-mono text-sm">{data.processor_class}</DialogTitle>
                                                <DialogDescription>
                                                    Edit logic PHP untuk processor ini. Hati-hati, kesalahan syntax akan menyebabkan error 500.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="flex-1 relative border rounded-md overflow-hidden bg-slate-950 mt-4">
                                                {editorLoading ? (
                                                    <div className="absolute inset-0 flex items-center justify-center text-white">
                                                        <Loader2 className="h-8 w-8 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        className="absolute inset-0 w-full h-full bg-slate-950 text-slate-50 font-mono text-xs p-4 focus:outline-none resize-none overflow-auto custom-scrollbar"
                                                        value={editorContent}
                                                        onChange={(e) => setEditorContent(e.target.value)}
                                                        spellCheck={false}
                                                    />
                                                )}
                                            </div>
                                            <DialogFooter className="mt-4 sm:justify-between">
                                                <Button type="button" variant="ghost" onClick={() => copyToClipboard(editorContent)} className="text-muted-foreground hover:text-foreground">
                                                    <Copy className="mr-2 h-4 w-4" />
                                                    Copy Code
                                                </Button>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>
                                                        Tutup
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        onClick={handleSaveProcessor}
                                                        disabled={editorLoading}
                                                        className={saveSuccess ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                                                    >
                                                        {editorLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        {saveSuccess ? (
                                                            <>
                                                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                                                Berhasil Disimpan
                                                            </>
                                                        ) : (
                                                            'Simpan Perubahan'
                                                        )}
                                                    </Button>
                                                </div>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    {(!data.processor_class || data.processor_class === 'App\\Services\\Rekonsiliasi\\Processors\\GenericProcessor') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="valid_response_codes">Filter Response Code</Label>
                                            <Input
                                                id="valid_response_codes"
                                                value={data.valid_response_codes || ''}
                                                onChange={(e) => setData('valid_response_codes', e.target.value)}
                                                placeholder="Contoh: 00,05"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Pisahkan dengan koma jika lebih dari satu. Kosongkan jika semua dianggap berhasil.
                                            </p>
                                        </div>
                                    )}

                                    {/* Column Mapping */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <Label className="text-base">Mapping Kolom Tabel *</Label>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Definisikan kolom yang akan ditampilkan di tabel
                                                </p>
                                            </div>
                                            <Button type="button" variant="outline" size="sm" onClick={addColumn}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Tambah Kolom
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {columns.map((column, index) => {
                                                const isCustomMode = !!data.processor_class && data.processor_class !== 'App\\Services\\Rekonsiliasi\\Processors\\GenericProcessor';

                                                return (
                                                    <div key={index} className="p-4 border rounded-lg space-y-3">
                                                        <div className="grid grid-cols-12 gap-3">
                                                            <div className="col-span-3">
                                                                <Label className="text-xs">Label Header</Label>
                                                                <Input
                                                                    value={column.label}
                                                                    onChange={(e) => updateColumn(index, 'label', e.target.value)}
                                                                    placeholder="Judul Kolom"
                                                                    className="mt-1"
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <Label className="text-xs">
                                                                    {isCustomMode ? 'Key Data (dari PHP)' : 'Path JSON'}
                                                                </Label>
                                                                <Input
                                                                    value={column.path}
                                                                    onChange={(e) => updateColumn(index, 'path', e.target.value)}
                                                                    placeholder={isCustomMode ? 'kode_bayar' : 'Wfirstdata.2'}
                                                                    className="mt-1 font-mono"
                                                                />
                                                            </div>
                                                            <div className="col-span-3">
                                                                <Label className="text-xs">Tipe Data</Label>
                                                                <Select
                                                                    value={column.type}
                                                                    onValueChange={(value) => updateColumn(index, 'type', value)}
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

                                                            {!isCustomMode && (
                                                                <>
                                                                    <div className="col-span-1">
                                                                        <Label className="text-[10px]">Start</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={column.substring_start || ''}
                                                                            onChange={(e) => updateColumn(index, 'substring_start', e.target.value ? parseInt(e.target.value) : '')}
                                                                            placeholder="0"
                                                                            className="mt-1 px-2 text-center"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-1">
                                                                        <Label className="text-[10px]">Len</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={column.substring_length || ''}
                                                                            onChange={(e) => updateColumn(index, 'substring_length', e.target.value ? parseInt(e.target.value) : '')}
                                                                            placeholder="10"
                                                                            className="mt-1 px-2 text-center"
                                                                        />
                                                                    </div>
                                                                </>
                                                            )}

                                                            <div className={`${isCustomMode ? 'col-span-3' : 'col-span-1'} flex items-end justify-end mt-2 md:mt-0`}>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeColumn(index)}
                                                                    disabled={columns.length === 1}
                                                                    className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        <div className="bg-muted p-4 rounded-lg text-sm">
                                            <p className="font-medium mb-2">Contoh Path Mapping:</p>
                                            <ul className="space-y-1 text-muted-foreground">
                                                <li><code>Wfirstdata.2</code> → Ambil index 2 dari array Wfirstdata</li>
                                                <li><code>Wseconddata.10</code> → Ambil index 10 dari array Wseconddata</li>
                                                <li><code>Wtxamount</code> → Ambil langsung dari field Wtxamount</li>
                                                <li><code>Wtransdate</code> → Ambil langsung dari field Wtransdate</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Status Aktif</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Template aktif dapat digunakan oleh proccode
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Link href="/admin/templates">
                                            <Button type="button" variant="outline">
                                                Batal
                                            </Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {processing ? 'Menyimpan...' : 'Simpan'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Live Fetch (5 col) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6">
                            <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-900 dark:bg-blue-950/10">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Search className="h-4 w-4 text-blue-600" />
                                        Live Data Preview
                                    </CardTitle>
                                    <CardDescription>
                                        Ambil sample data langsung dari API untuk referensi mapping
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Tanggal</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-8 justify-start text-left font-normal text-xs bg-background",
                                                        !fetchDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-3 w-3" />
                                                    {fetchDate ? format(fetchDate, "PPP", { locale: id }) : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={fetchDate}
                                                    onSelect={setFetchDate}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs">Referensi Proccode (Opsional)</Label>
                                        <Select
                                            onValueChange={(val) => {
                                                const p = proccodes?.find(x => x.code === val);
                                                if (p) {
                                                    setFetchProccode(p.code);
                                                    setFetchSource(p.source);
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="h-8 text-xs bg-background">
                                                <SelectValue placeholder="Pilih sample..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {proccodes?.map((p) => (
                                                    <SelectItem key={p.code + p.source} value={p.code} className="text-xs">
                                                        {p.name} ({p.source})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-xs">Proccode</Label>
                                            <Input
                                                value={fetchProccode}
                                                onChange={(e) => setFetchProccode(e.target.value)}
                                                placeholder="Contoh: 300001"
                                                className="h-8 text-xs bg-background"
                                            />
                                        </div>
                                        <div className="w-1/4 space-y-2">
                                            <Label className="text-xs">Source</Label>
                                            <Input
                                                value={fetchSource}
                                                onChange={(e) => setFetchSource(e.target.value)}
                                                placeholder="PSW"
                                                className="h-8 text-xs bg-background"
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="h-8"
                                                onClick={handleFetchSample}
                                                disabled={fetchLoading}
                                            >
                                                {fetchLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ambil Data'}
                                            </Button>
                                        </div>
                                    </div>

                                    {fetchedData ? (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <Label className="text-xs">
                                                    Result ({Array.isArray(fetchedData) ? fetchedData.length : 1} {Array.isArray(fetchedData) && fetchedData.length !== 1 ? 'Items' : 'Item'})
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-[10px]"
                                                        onClick={() => copyToClipboard(JSON.stringify(fetchedData, null, 2))}
                                                    >
                                                        <Copy className="h-3 w-3 mr-1" />
                                                        Copy JSON
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-[10px]"
                                                        onClick={() => setJsonPreviewOpen(true)}
                                                        title="Expand View"
                                                    >
                                                        <Maximize2 className="h-3 w-3 mr-1" />
                                                        Expand
                                                    </Button>
                                                    <StringParserHelper />
                                                </div>
                                            </div>
                                            <div className="rounded-lg border bg-neutral-900 p-3 overflow-hidden relative">
                                                <pre className="text-[10px] text-green-400 font-mono overflow-auto max-h-[400px]">
                                                    {JSON.stringify(fetchedData, null, 2)}
                                                </pre>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2">
                                                Gunakan key/path dari JSON di atas untuk mengisi "Path Data" di form sebelah kiri.
                                            </p>

                                            {/* Full Screen JSON Preview Modal */}
                                            <Dialog open={jsonPreviewOpen} onOpenChange={setJsonPreviewOpen}>
                                                <DialogContent className="!max-w-[80vw] sm:!max-w-[80vw] h-[80vh] flex flex-col p-4">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center justify-between">
                                                            <span>Full JSON Preview</span>
                                                            <div className="flex items-center gap-2 mr-6">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => copyToClipboard(JSON.stringify(fetchedData, null, 2))}
                                                                >
                                                                    <Copy className="h-4 w-4 mr-2" />
                                                                    Copy JSON
                                                                </Button>
                                                            </div>
                                                        </DialogTitle>
                                                    </DialogHeader>
                                                    <div className="flex-1 bg-neutral-950 rounded-md border p-4 overflow-hidden relative">
                                                        <pre className="text-xs text-green-400 font-mono h-full overflow-auto custom-scrollbar">
                                                            {JSON.stringify(fetchedData, null, 2)}
                                                        </pre>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button variant="secondary" onClick={() => setJsonPreviewOpen(false)}>
                                                            Tutup
                                                        </Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center border-2 border-dashed rounded-lg bg-background/50">
                                            <p className="text-xs text-muted-foreground">
                                                Data belum diambil.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div >
                </div >
            </div >

        </>
    );
}

TemplateForm.layout = (page: React.ReactElement<Props>) => (
    <AppLayout breadcrumbs={getBreadcrumbs(page.props.template)}>{page}</AppLayout>
);

export default TemplateForm;
