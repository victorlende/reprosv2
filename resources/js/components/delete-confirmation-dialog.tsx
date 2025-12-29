import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    loading?: boolean;
}

export function DeleteConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    title = 'Hapus Data',
    description = 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
    loading = false,
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0">
                <div className="p-6 pt-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-3 bg-red-100 rounded-full dark:bg-red-900/20">
                        <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-semibold">
                            {title}
                        </DialogTitle>
                        <DialogDescription className="text-center max-w-[85%] mx-auto">
                            {description}
                        </DialogDescription>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-6 pt-2 justify-center w-full">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="flex-1"
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        {loading ? 'Menghapus...' : 'Ya, Hapus'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
