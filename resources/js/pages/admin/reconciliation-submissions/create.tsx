import { FormEventHandler, useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    ArrowLeft,
    Upload,
    FileText,
    Save, // Added Save icon
    X,
    Send,
    Paperclip,
    Trash2,
    Wand2,
    FileInput,
    Mails,
    Plus,
    Pencil,
    MoreHorizontal,
    Eye,
    Loader2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin',
    },
    {
        title: 'Submission',
        href: '/admin/reconciliation-submissions',
    },
    {
        title: 'Compose',
        href: '/admin/reconciliation-submissions/create',
    },
];

interface EmailDestination {
    id: number;
    name: string;
    email: string;
}

interface ReconciliationTemplate {
    id: number;
    name: string;
    content: string;
}

interface Props {
    emailDestinations: EmailDestination[];
    templates: ReconciliationTemplate[];
}

function ReconciliationSubmissionCreate({ emailDestinations, templates }: Props) {
    const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
    const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ReconciliationTemplate | null>(null);

    // File Preview State
    const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [previewFileName, setPreviewFileName] = useState('');
    const [submitAction, setSubmitAction] = useState<'draft' | 'send' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        email_destination_ids: [] as string[],
        files: [] as File[],
        subject: '',
        body_note: '',
        transaction_date_start: subDays(new Date(), 1) as Date | undefined, // Default to Yesterday
        transaction_date_end: subDays(new Date(), 1) as Date | undefined,   // Default to Yesterday
        is_draft: false,
    });

    const templateForm = useForm({
        name: '',
        content: '',
    });

    // Auto-generate default subject
    useEffect(() => {
        if (!data.subject) {
            const today = new Date().toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
            setData('subject', `Rekonsiliasi Data - ${today}`);
        }
    }, []);

    // Auto-update subject when dates change
    useEffect(() => {
        if (data.transaction_date_start && data.transaction_date_end) {
            const start = format(data.transaction_date_start, 'dd MMM yyyy', { locale: id });
            const end = format(data.transaction_date_end, 'dd MMM yyyy', { locale: id });

            let dateString = start;
            if (start !== end) {
                dateString = `${start} - ${end}`;
            }

            const newSubject = `Laporan Transaksi ${dateString}`;
            if (data.subject !== newSubject) {
                setData('subject', newSubject);
            }
        }
    }, [data.transaction_date_start?.toISOString(), data.transaction_date_end?.toISOString()]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setData('files', [...data.files, ...newFiles]);
        }
    };

    const handlePreviewFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setPreviewContent(e.target.result as string);
                setPreviewFileName(file.name);
                setIsPreviewDialogOpen(true);
            }
        };
        reader.readAsText(file);
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = [...data.files];
        newFiles.splice(index, 1);
        setData('files', newFiles);
    };

    const handleAddRecipient = (value: string) => {
        if (!data.email_destination_ids.includes(value)) {
            setData('email_destination_ids', [...data.email_destination_ids, value]);
        }
    };

    const handleRemoveRecipient = (id: string) => {
        setData('email_destination_ids', data.email_destination_ids.filter(existingId => existingId !== id));
    };

    const applyTemplate = (template: ReconciliationTemplate) => {
        setData((prev) => ({
            ...prev,
            body_note: template.content,
        }));
        toast.success('Template applied');
    };

    const handleOpenCreateTemplate = () => {
        setEditingTemplate(null);
        templateForm.setData({
            name: '',
            content: data.body_note || '', // Pre-fill with current note if available
        });
        setIsTemplateDialogOpen(true);
    };

    const handleOpenEditTemplate = (template: ReconciliationTemplate, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTemplate(template);
        templateForm.setData({
            name: template.name,
            content: template.content,
        });
        setIsTemplateDialogOpen(true);
    };

    const handleSaveTemplate = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingTemplate) {
            templateForm.put(route('admin.reconciliation-templates.update', editingTemplate.id), {
                onSuccess: () => {
                    setIsTemplateDialogOpen(false);
                    templateForm.reset();
                    setEditingTemplate(null);
                    toast.success('Template updated');
                }
            });
        } else {
            templateForm.post(route('admin.reconciliation-templates.store'), {
                onSuccess: () => {
                    setIsTemplateDialogOpen(false);
                    templateForm.reset();
                    toast.success('Template created');
                }
            });
        }
    };

    const handleDeleteTemplate = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this template?')) {
            router.delete(route('admin.reconciliation-templates.destroy', id), {
                onSuccess: () => toast.success('Template deleted')
            });
        }
    };

    const submit: FormEventHandler = (e) => {
        handleSubmit(e, false);
    };

    const handleSubmit = (e: React.FormEvent, isDraft: boolean) => {
        e.preventDefault();
        setSubmitAction(isDraft ? 'draft' : 'send');

        // Format dates as YYYY-MM-DD for Laravel before submitting
        const submitData = {
            ...data,
            transaction_date_start: data.transaction_date_start
                ? format(data.transaction_date_start, 'yyyy-MM-dd')
                : undefined,
            transaction_date_end: data.transaction_date_end
                ? format(data.transaction_date_end, 'yyyy-MM-dd')
                : undefined,
        };

        // Use router.post with FormData
        const formData = new FormData();

        // Add is_draft flag
        if (isDraft) {
            formData.append('is_draft', '1');
        }

        // Add email destinations
        submitData.email_destination_ids.forEach((id) => {
            formData.append('email_destination_ids[]', id);
        });

        // Add files
        submitData.files.forEach((file) => {
            formData.append('files[]', file);
        });

        // Add other fields
        formData.append('subject', submitData.subject);
        formData.append('body_note', submitData.body_note);

        if (submitData.transaction_date_start) {
            formData.append('transaction_date_start', submitData.transaction_date_start);
        }
        if (submitData.transaction_date_end) {
            formData.append('transaction_date_end', submitData.transaction_date_end);
        }

        router.post('/admin/reconciliation-submissions', formData, {
            onStart: () => setIsSubmitting(true),
            onFinish: () => setIsSubmitting(false),
            onSuccess: () => {
                // Success handled by redirect
            },
            onError: () => {
                toast.error(isDraft ? 'Failed to save draft' : 'Failed to send email');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Compose Email" />

            <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
                {/* Header Action Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/reconciliation-submissions">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight">New Message</h1>
                            <p className="text-sm text-muted-foreground">Reconciliation Submission</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground mr-2">
                            {isSubmitting ? 'Sending...' : 'Draft'}
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Composer Area */}
                    <div className="flex-1 flex justify-center p-6 overflow-y-auto">
                        <Card className="w-full max-w-4xl h-fit min-h-[600px] shadow-none border rounded-lg flex flex-col">
                            <form className="flex-1 flex flex-col">
                                {/* To Field */}
                                <div className="px-6 py-4 flex items-start gap-4 border-b hover:bg-muted/5 transition-colors">
                                    <div className="w-16 pt-1 flex items-center justify-end gap-2">
                                        <Mails className="h-4 w-4 text-muted-foreground" />
                                        <Label htmlFor="to" className="text-muted-foreground font-medium cursor-pointer">To</Label>
                                    </div>
                                    <div className="flex-1">
                                        {/* Selected Recipients Badges */}
                                        {data.email_destination_ids.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {data.email_destination_ids.map((id) => {
                                                    const dest = emailDestinations.find(d => d.id.toString() === id);
                                                    if (!dest) return null;
                                                    return (
                                                        <Badge key={id} variant="secondary" className="px-2 py-1 gap-1 font-normal text-sm bg-muted-foreground/15 hover:bg-muted-foreground/25 text-foreground rounded-full">
                                                            {dest.name} &lt;{dest.email}&gt;
                                                            <div
                                                                role="button"
                                                                className="ml-1 rounded-full p-0.5 hover:bg-black/10 transition-colors cursor-pointer"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRemoveRecipient(id);
                                                                }}
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </div>
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <Select
                                            value=""
                                            onValueChange={handleAddRecipient}
                                        >
                                            <SelectTrigger className="border-0 shadow-none focus:ring-0 px-0 py-1 h-auto font-medium w-full justify-start gap-2">
                                                <SelectValue placeholder="Select Recipient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {emailDestinations.map((destination) => (
                                                    <SelectItem
                                                        key={destination.id}
                                                        value={destination.id.toString()}
                                                        disabled={data.email_destination_ids.includes(destination.id.toString())}
                                                    >
                                                        {destination.name} &lt;{destination.email}&gt;
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.email_destination_ids && (
                                            <p className="text-xs text-destructive mt-1">{errors.email_destination_ids}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Transaction Date Range */}
                                <div className="px-6 py-4 flex items-center gap-4 border-b hover:bg-muted/5 transition-colors">
                                    <Label className="w-16 text-muted-foreground font-medium text-right pt-1">Period</Label>
                                    <div className="flex-1 flex gap-4">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] justify-start text-left font-normal bg-background shadow-none",
                                                        !data.transaction_date_start && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.transaction_date_start ? format(data.transaction_date_start, "dd MMM yyyy", { locale: id }) : <span>Pick Start Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.transaction_date_start}
                                                    onSelect={(date) => setData('transaction_date_start', date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <div className="flex items-center text-muted-foreground">-</div>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] justify-start text-left font-normal bg-background shadow-none",
                                                        !data.transaction_date_end && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {data.transaction_date_end ? format(data.transaction_date_end, "dd MMM yyyy", { locale: id }) : <span>Pick End Date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={data.transaction_date_end}
                                                    onSelect={(date) => setData('transaction_date_end', date)}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Subject Field */}
                                <div className="px-6 py-3 flex items-center gap-4 border-b hover:bg-muted/5 transition-colors">
                                    <Label htmlFor="subject" className="w-16 text-muted-foreground font-medium text-right">Subject</Label>
                                    <Input
                                        id="subject"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="flex-1 border-0 shadow-none focus-visible:ring-0 px-0 h-auto font-medium placeholder:text-muted-foreground/50"
                                        placeholder="Enter subject here..."
                                    />
                                    {errors.subject && (
                                        <p className="text-xs text-destructive">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Editor */}
                                <div className="flex-1 flex flex-col min-h-[300px]">
                                    <RichTextEditor
                                        value={data.body_note}
                                        onChange={(value) => setData('body_note', value)}
                                        placeholder="Write your message here..."
                                        className="border-0 rounded-none flex-1 focus-visible:ring-0 [&_.ProseMirror]:min-h-[300px] [&_.ProseMirror]:px-6 [&_.ProseMirror]:py-4"
                                    />
                                    {errors.body_note && (
                                        <p className="px-6 text-sm text-destructive">{errors.body_note}</p>
                                    )}
                                </div>

                                {/* Attachments Area */}
                                <div className="px-6 py-4 border-t bg-muted/5 flex items-start gap-4 min-h-[80px]">
                                    <div className="flex flex-col gap-2 pt-2">
                                        <Label
                                            htmlFor="file-upload"
                                            className="cursor-pointer inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-muted/50 transition-colors border border-dashed border-muted-foreground/30 hover:border-primary/50 hover:text-primary text-muted-foreground"
                                            title="Attach Files"
                                        >
                                            <Paperclip className="h-5 w-5" />
                                            <input
                                                id="file-upload"
                                                type="file"
                                                multiple
                                                accept=".txt"
                                                onChange={handleFileChange}
                                                className="sr-only"
                                            />
                                        </Label>
                                        <div className="text-[10px] text-center text-muted-foreground font-medium">
                                            {data.files.length} File{data.files.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        {data.files.length > 0 ? (
                                            <div className="flex flex-wrap gap-3">
                                                {data.files.map((file, index) => {
                                                    const colors = [
                                                        { bg: 'bg-blue-100', text: 'text-blue-600' },
                                                        { bg: 'bg-emerald-100', text: 'text-emerald-600' },
                                                        { bg: 'bg-violet-100', text: 'text-violet-600' },
                                                        { bg: 'bg-amber-100', text: 'text-amber-600' },
                                                        { bg: 'bg-rose-100', text: 'text-rose-600' },
                                                    ];
                                                    const color = colors[index % colors.length];

                                                    return (
                                                        <div key={index} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-background animate-in fade-in slide-in-from-bottom-2">
                                                            <div className={`${color.bg} p-2 rounded`}>
                                                                <FileText className={`h-5 w-5 ${color.text}`} />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium max-w-[200px] truncate" title={file.name}>
                                                                    {file.name}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">TXT File</span>
                                                            </div>
                                                            <div className="flex items-center ml-2">
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-muted-foreground hover:text-primary"
                                                                                onClick={() => handlePreviewFile(file)}
                                                                            >
                                                                                <Eye className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Preview File</TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                                    onClick={() => handleRemoveFile(index)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="h-10 flex items-center text-sm text-muted-foreground italic">
                                                No files attached. Click the icon to upload.
                                            </div>
                                        )}
                                        {errors.files && <p className="text-sm text-destructive mt-2">{errors.files}</p>}
                                    </div>
                                </div>

                                {/* Footer Toolbar */}
                                <div className="px-6 py-4 border-t bg-muted/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            size="lg"
                                            variant="secondary"
                                            className="gap-2 px-6 rounded-full shadow-none hover:bg-secondary/80 transition-all border"
                                            disabled={isSubmitting}
                                            onClick={(e) => handleSubmit(e, true)}
                                        >
                                            {isSubmitting && submitAction === 'draft' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            {isSubmitting && submitAction === 'draft' ? 'Saving...' : 'Save Draft'}
                                        </Button>
                                        <Button
                                            type="button"
                                            size="lg"
                                            className="gap-2 px-8 rounded-full shadow-none hover:bg-primary/90 transition-all text-white"
                                            disabled={isSubmitting}
                                            onClick={(e) => handleSubmit(e, false)}
                                        >
                                            {isSubmitting && submitAction === 'send' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                            {isSubmitting && submitAction === 'send' ? 'Sending...' : 'Send'}
                                        </Button>

                                        <div className="h-6 w-px bg-border mx-2" />

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button type="button" variant="ghost" size="icon" onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}>
                                                        <FileInput className="h-5 w-5 text-muted-foreground" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Use Templates</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>

                                    <Button type="button" variant="ghost" size="icon" onClick={() => window.history.back()}>
                                        <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>

                    {/* Right Sidebar - Templates (Collapsible) */}
                    <div className={cn(
                        "w-80 border-l bg-background transition-all duration-300 ease-in-out absolute right-0 top-0 bottom-0 shadow-xl z-20 lg:relative lg:shadow-none lg:z-0",
                        isTemplateMenuOpen ? "translate-x-0" : "translate-x-full lg:hidden"
                    )}>
                        <div className="h-full flex flex-col">
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Wand2 className="h-4 w-4 text-primary" />
                                    Templates
                                </h3>
                                <div className="flex items-center gap-1">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={handleOpenCreateTemplate} className="h-8 w-8">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Create New Template</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                    <Button variant="ghost" size="icon" onClick={() => setIsTemplateMenuOpen(false)} className="lg:hidden">
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-3">
                                    {templates.length === 0 ? (
                                        <div className="text-center py-10 text-muted-foreground text-sm">
                                            <p>No templates found.</p>
                                            <Button variant="link" onClick={handleOpenCreateTemplate} className="mt-2 text-primary">
                                                Create your first template
                                            </Button>
                                        </div>
                                    ) : (
                                        templates.map((template) => (
                                            <Card
                                                key={template.id}
                                                className="cursor-pointer hover:border-primary/50 transition-colors group relative"
                                                onClick={() => applyTemplate(template)}
                                            >
                                                <div className="p-3 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-sm text-foreground/80 group-hover:text-primary truncate pr-6">{template.name}</span>
                                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                                                                        <MoreHorizontal className="h-3 w-3" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={(e) => handleOpenEditTemplate(template, e as any)}>
                                                                        <Pencil className="mr-2 h-3 w-3" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => handleDeleteTemplate(template.id, e as any)}>
                                                                        <Trash2 className="mr-2 h-3 w-3" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                    <div
                                                        className="text-xs text-muted-foreground line-clamp-2"
                                                        dangerouslySetInnerHTML={{ __html: template.content.replace(/<[^>]+>/g, ' ') }}
                                                    />
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-muted/10">
                                <p className="text-xs text-muted-foreground">
                                    Click a template to apply it. Use + to save current note as template.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Template Dialog */}
                    <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                        <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleSaveTemplate}>
                                <DialogHeader>
                                    <DialogTitle>{editingTemplate ? 'Edit Template' : 'Save as Template'}</DialogTitle>
                                    <DialogDescription>
                                        {editingTemplate ? 'Update your template content.' : 'Save your current message as a reusable template.'}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="template-name">Template Name</Label>
                                        <Input
                                            id="template-name"
                                            value={templateForm.data.name}
                                            onChange={(e) => templateForm.setData('name', e.target.value)}
                                            placeholder="e.g., Monthly Report"
                                        />
                                        {templateForm.errors.name && <p className="text-xs text-destructive">{templateForm.errors.name}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="template-content">Content</Label>
                                        <RichTextEditor
                                            value={templateForm.data.content}
                                            onChange={(value) => templateForm.setData('content', value)}
                                            className="min-h-[200px]"
                                        />
                                        {templateForm.errors.content && <p className="text-xs text-destructive">{templateForm.errors.content}</p>}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={templateForm.processing}>
                                        {editingTemplate ? 'Update' : 'Save'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* File Preview Dialog */}
                    <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
                        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    {previewFileName}
                                </DialogTitle>
                                <DialogDescription className="sr-only">
                                    Preview content of the attached file.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-hidden border rounded-md bg-muted/10 p-4">
                                <ScrollArea className="h-full">
                                    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground/80">
                                        {previewContent}
                                    </pre>
                                </ScrollArea>
                            </div>
                            <DialogFooter>
                                <Button type="button" onClick={() => setIsPreviewDialogOpen(false)}>
                                    Close
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </AppLayout>
    );
}

export default ReconciliationSubmissionCreate;
