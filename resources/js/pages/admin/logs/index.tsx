import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Search, RefreshCw, AlertTriangle, AlertCircle, Info, Bug } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/delete-confirmation-dialog';
import { type BreadcrumbItem } from '@/types';

interface LogEntry {
    timestamp: string;
    environment: string;
    level: string;
    message: string;
}

interface Props {
    logs: LogEntry[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'System Logs', href: '/admin/logs' },
];

export default function LogViewerIndex({ logs }: Props) {
    const [search, setSearch] = useState('');
    const [isClearing, setIsClearing] = useState(false);
    const [confirmingClear, setConfirmingClear] = useState(false);

    const filteredLogs = logs.filter(log =>
        log.message.toLowerCase().includes(search.toLowerCase()) ||
        log.level.toLowerCase().includes(search.toLowerCase()) ||
        log.timestamp.includes(search)
    );

    const handleClearLogs = () => {
        setIsClearing(true);
        router.delete('/admin/logs', {
            onFinish: () => {
                setIsClearing(false);
                setConfirmingClear(false);
            },
        });
    };

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'error':
            case 'critical':
            case 'alert':
            case 'emergency':
                return <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {level.toUpperCase()}</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {level.toUpperCase()}</Badge>;
            case 'debug':
                return <Badge variant="secondary" className="flex items-center gap-1"><Bug className="w-3 h-3" /> {level.toUpperCase()}</Badge>;
            default:
                return <Badge variant="outline" className="flex items-center gap-1"><Info className="w-3 h-3" /> {level.toUpperCase()}</Badge>;
        }
    };

    const handleRefresh = () => {
        router.reload();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Logs" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">System Logs</h1>
                        <p className="text-muted-foreground mt-1">Monitor aktivitas dan error sistem (laravel.log)</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="destructive" onClick={() => setConfirmingClear(true)} disabled={logs.length === 0}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear Logs
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div className="space-y-1">
                            <CardTitle>Log Entries</CardTitle>
                            <CardDescription>
                                Menampilkan max 500 baris terakhir. Total: {filteredLogs.length} entry.
                            </CardDescription>
                        </div>
                        <div className="w-[300px]">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-8"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border font-mono text-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead className="w-[120px]">Level</TableHead>
                                        <TableHead>Message</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredLogs.length > 0 ? (
                                        filteredLogs.map((log, index) => (
                                            <TableRow key={index} className="hover:bg-muted/50">
                                                <TableCell className="whitespace-nowrap text-muted-foreground">
                                                    {log.timestamp}
                                                </TableCell>
                                                <TableCell>
                                                    {getLevelBadge(log.level)}
                                                </TableCell>
                                                <TableCell className="break-all whitespace-pre-wrap max-w-3xl">
                                                    {log.message}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="h-32 text-center text-muted-foreground">
                                                {logs.length === 0 ? "Log file is empty." : "No logs match your search."}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DeleteConfirmationDialog
                open={confirmingClear}
                onOpenChange={setConfirmingClear}
                onConfirm={handleClearLogs}
                title="Clear System Logs"
                description="Are you sure you want to clear the entire log file? This action cannot be undone."
                loading={isClearing}
            />
        </AppLayout>
    );
}
