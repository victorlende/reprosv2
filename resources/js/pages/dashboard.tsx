import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface ActiveUser {
    name: string;
    email: string;
    ip_address: string;
    last_activity: string;
}

interface Service {
    code: string;
    name: string;
    description: string | null;
    category: string;
    source: string;
}

export default function Dashboard() {
    const { activeUsers, services } = usePage<{ activeUsers: ActiveUser[]; services: Record<string, Service[]> }>().props;
    const [searchQuery, setSearchQuery] = useState('');

    // Flatten services for the table view
    const allServices = Object.values(services).flat().sort((a, b) => {
        // Sort by Category first, then Name
        if (a.category < b.category) return -1;
        if (a.category > b.category) return 1;
        return a.name.localeCompare(b.name);
    });

    // Filter services based on search query
    const filteredServices = allServices.filter(service => {
        if (!searchQuery) return true;

        const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
        const serviceText = `${service.name} ${service.code} ${service.category} ${service.description || ''}`.toLowerCase();

        // Every term must appear somewhere in the service data
        return searchTerms.every(term => serviceText.includes(term));
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">

                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 items-start">
                    {/* Left Column: Active Users Stats */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="rounded-xl border bg-background p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-muted-foreground">Active Users</h3>
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-4xl font-bold tracking-tight text-foreground">{activeUsers.length}</div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Currently logged in to the system
                            </p>
                        </div>

                        {/* Active Users List Card */}
                        <div className="rounded-xl border bg-background p-6">
                            <h3 className="font-medium text-muted-foreground mb-4">Users Online</h3>
                            <div className="space-y-4">
                                {activeUsers.length === 0 ? (
                                    <p className="text-sm text-muted-foreground text-center py-4">
                                        Tidak ada user lain yang aktif.
                                    </p>
                                ) : (
                                    activeUsers.map((user, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                                                <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                                            </div>
                                            <div className="h-2 w-2 rounded-full bg-green-500" title="Online"></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Service Catalog - Payment Menus (Table View) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-xl border bg-background p-6 h-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight">Katalog Layanan</h2>
                                    <p className="text-sm text-muted-foreground mt-1">Daftar menu pembayaran yang tersedia.</p>
                                </div>
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Cari layanan..."
                                        className="pl-9 h-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="rounded-md border overflow-hidden">
                                <div className="overflow-auto max-h-[600px] relative">
                                    <Table>
                                        <TableHeader className="bg-background sticky top-0 z-10">
                                            <TableRow className="hover:bg-transparent border-b">
                                                <TableHead className="w-[50px] font-medium pl-4">No</TableHead>
                                                <TableHead className="w-[120px] font-medium">Kategori</TableHead>
                                                <TableHead className="w-[100px] font-medium">Kode</TableHead>
                                                <TableHead className="font-medium">Nama Layanan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredServices.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-64 text-center text-muted-foreground">
                                                        {searchQuery ? (
                                                            <div className="flex flex-col items-center justify-center gap-2">
                                                                <Search className="h-8 w-8 opacity-20" />
                                                                <p className="text-sm">Tidak ada layanan yang cocok dengan "{searchQuery}"</p>
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm">Belum ada layanan yang tersedia.</p>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredServices.map((service, index) => (
                                                    <TableRow key={service.code} className="hover:bg-muted/50 border-b last:border-0 transition-colors">
                                                        <TableCell className="text-muted-foreground text-sm py-3 pl-4">{index + 1}</TableCell>
                                                        <TableCell className="py-3">
                                                            <span className="capitalize text-sm font-medium text-muted-foreground">
                                                                {service.category}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-3">
                                                            <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                                                {service.code}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-medium text-foreground py-3 text-sm">
                                                            {service.name}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="border-t p-3 text-[10px] text-muted-foreground flex justify-between items-center bg-muted/20 px-4">
                                    <span>Menampilkan {filteredServices.length} dari {allServices.length} layanan</span>
                                    <span>Updated Realtime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active User List - Hidden */}
                <div className="hidden">
                    {/* ... (Existing hidden table kept for data reference if needed later) ... */}
                </div>
            </div>
        </AppLayout>
    );
}
