import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, RefreshCcw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { District, Proccode, MatrixData, formatCurrency } from './types';
import { BreadcrumbItem } from '@/types';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper,
    ColumnDef,
    SortingState,
    getSortedRowModel,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Konsolidasi Data', href: '/admin/konsolidasi' },
];

interface Props {
    districts: District[];
    proccodes: Proccode[];
    matrix: MatrixData;
    last_update: string | null;
}

export default function KonsolidasiIndex({ districts, proccodes, matrix, last_update }: Props) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const getCell = (districtId: number, proccodeId: number) => {
        const key = `${districtId}_${proccodeId}`;
        return matrix[key] || { trx: 0, nominal: 0 };
    };

    // Calculate Totals per District
    const getDistrictTotal = (districtId: number) => {
        let totalTrx = 0;
        let totalNominal = 0;
        proccodes.forEach(p => {
            const cell = getCell(districtId, p.id);
            totalTrx += Number(cell.trx);
            totalNominal += Number(cell.nominal);
        });
        return { trx: totalTrx, nominal: totalNominal };
    };

    // Calculate Grand Total for Footer
    const grandTotal = useMemo(() => {
        let totalTrx = 0;
        let totalNominal = 0;
        districts.forEach(d => {
            const rowTotal = getDistrictTotal(d.id);
            totalTrx += rowTotal.trx;
            totalNominal += rowTotal.nominal;
        });
        return { trx: totalTrx, nominal: totalNominal };
    }, [districts, proccodes, matrix]);

    const getProccodeTotal = (proccodeId: number) => {
        let totalTrx = 0;
        let totalNominal = 0;
        districts.forEach(d => {
            const cell = getCell(d.id, proccodeId);
            totalTrx += Number(cell.trx);
            totalNominal += Number(cell.nominal);
        });
        return { trx: totalTrx, nominal: totalNominal };
    };

    // Define Columns
    const columns = useMemo(() => {
        const columnHelper = createColumnHelper<District>();

        const dynamicCols = proccodes.map(p =>
            columnHelper.group({
                id: `group_${p.id}`,
                header: () => <span className="uppercase tracking-wider">{p.name.split(' - ')[0]}</span>,
                columns: [
                    columnHelper.accessor(
                        row => getCell(row.id, p.id).trx,
                        {
                            id: `trx_${p.id}`,
                            header: "Transaksi",
                            cell: info => {
                                const val = info.getValue();
                                if (val === 0) return <span className="text-muted-foreground/20">-</span>;
                                return (
                                    <Link
                                        href={`/admin/konsolidasi/detail?district_id=${info.row.original.id}&proccode_id=${p.id}`}
                                        className="inline-flex items-center justify-center rounded-none px-2 py-1 hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/30 dark:text-blue-400 font-medium transition-colors"
                                    >
                                        {new Intl.NumberFormat('id-ID').format(val)}
                                    </Link>
                                );
                            },
                            footer: () => new Intl.NumberFormat('id-ID').format(getProccodeTotal(p.id).trx),
                        }
                    ),
                    columnHelper.accessor(
                        row => getCell(row.id, p.id).nominal,
                        {
                            id: `nom_${p.id}`,
                            header: "Nominal",
                            cell: info => {
                                const val = info.getValue();
                                return val > 0 ? (
                                    <span className="text-foreground">{formatCurrency(val)}</span>
                                ) : <span className="text-muted-foreground/20">-</span>;
                            },
                            footer: () => formatCurrency(getProccodeTotal(p.id).nominal),
                        }
                    )
                ]
            })
        );

        return [
            columnHelper.accessor('name', {
                header: "KABUPATEN",
                cell: info => <span className="font-medium">{info.getValue()}</span>,
                footer: "TOTAL",
                enableSorting: true,
            }),
            ...dynamicCols,
            columnHelper.group({
                id: 'total_group',
                header: "TOTAL REALISASI",
                columns: [
                    columnHelper.accessor(
                        row => getDistrictTotal(row.id).trx,
                        {
                            id: 'total_trx',
                            header: "Transaksi",
                            cell: info => new Intl.NumberFormat('id-ID').format(info.getValue()),
                            footer: () => new Intl.NumberFormat('id-ID').format(grandTotal.trx),
                        }
                    ),
                    columnHelper.accessor(
                        row => getDistrictTotal(row.id).nominal,
                        {
                            id: 'total_nom',
                            header: "Nominal",
                            cell: info => formatCurrency(info.getValue()),
                            footer: () => formatCurrency(grandTotal.nominal),
                        }
                    )
                ]
            })
        ];
    }, [proccodes, matrix, districts, grandTotal]); // Dependencies included

    const table = useReactTable({
        data: districts,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
            sorting,
            pagination,
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konsolidasi Data" />

            <div className="flex bg-muted/10 flex-col gap-4 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Konsolidasi Data</h1>
                        <p className="text-muted-foreground">
                            Laporan Konsolidasi Transaksi per Kabupaten
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" className="shadow-none" asChild>
                            <a href="/admin/konsolidasi/export" target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Export Excel
                            </a>
                        </Button>
                        <Button asChild className="shadow-none">
                            <Link href="/admin/konsolidasi/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Ambil Data Baru
                            </Link>
                        </Button>
                    </div>
                </div>

                <Card className="border-border/60 shadow-none flex flex-col">
                    <CardHeader className="pb-3 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 bg-background/50 backdrop-blur-sm">
                        <div className="space-y-1">
                            <CardTitle className="text-base">Matrix Realisasi</CardTitle>
                            <CardDescription>
                                Terakhir diperbarui: {last_update ? new Date(last_update).toLocaleString('id-ID') : '-'}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative w-full sm:w-[250px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kabupaten..."
                                    value={globalFilter}
                                    onChange={e => setGlobalFilter(e.target.value)}
                                    className="pl-8 bg-background"
                                />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => router.visit(window.location.href, { only: ['matrix', 'last_update'] })}>
                                <RefreshCcw className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="border">
                            <div className="relative">
                                <Table className="border-collapse border-b w-full">
                                    <TableHeader className="bg-muted/40 sticky top-0 z-20">
                                        {table.getHeaderGroups().map(headerGroup => (
                                            <TableRow key={headerGroup.id} className="border-b-border hover:bg-transparent">
                                                {headerGroup.headers.map(header => {
                                                    // Determine styling based on column depth and id
                                                    const isSticky = header.column.id === 'name';
                                                    const isTotal = header.column.id.includes('total');

                                                    return (
                                                        <TableHead
                                                            key={header.id}
                                                            colSpan={header.colSpan}
                                                            className={`
                                                            h-10 px-4 font-semibold text-foreground border-r border-border
                                                            ${isSticky ? 'sticky left-0 z-30 bg-background border-r border-border' : ''}
                                                            ${header.column.parent ? 'text-xs text-center h-9 bg-muted/20 text-muted-foreground' : 'text-center bg-muted/40'}
                                                            ${isTotal ? 'bg-muted/30' : ''}
                                                        `}
                                                            style={{ width: header.getSize() }}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.header,
                                                                    header.getContext()
                                                                )}
                                                        </TableHead>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows.length > 0 ? (
                                            table.getRowModel().rows.map(row => (
                                                <TableRow key={row.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                                                    {row.getVisibleCells().map(cell => {
                                                        const isSticky = cell.column.id === 'name';
                                                        const isTrx = cell.column.id.startsWith('trx') || cell.column.id === 'total_trx';
                                                        const isNom = cell.column.id.startsWith('nom') || cell.column.id === 'total_nom';
                                                        const isTotal = cell.column.id.includes('total');

                                                        return (
                                                            <TableCell
                                                                key={cell.id}
                                                                className={`
                                                                p-2 border-r border-border/50
                                                                ${isSticky ? 'sticky left-0 z-10 bg-background border-r border-border/50' : ''}
                                                                ${isTrx ? 'text-center font-mono text-xs' : ''}
                                                                ${isNom ? 'text-right font-mono text-xs text-muted-foreground' : ''}
                                                                ${isTotal ? 'bg-muted/10 font-bold' : ''}
                                                            `}
                                                            >
                                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                            </TableCell>
                                                        );
                                                    })}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    Tidak ada data.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                    <tfoot className="bg-muted/80 font-medium border-t border-border sticky bottom-0 z-20">
                                        {table.getFooterGroups().map(footerGroup => (
                                            <TableRow key={footerGroup.id}>
                                                {footerGroup.headers.map(header => {
                                                    const isSticky = header.column.id === 'name';

                                                    return (
                                                        <TableCell
                                                            key={header.id}
                                                            colSpan={header.colSpan}
                                                            className={`
                                                            p-2 border-r border-border font-mono text-xs font-bold
                                                            ${isSticky ? 'sticky left-0 z-30 bg-background/95 border-t border-r border-border text-right p-3' : ''}
                                                            ${header.column.id.includes('nom') ? 'text-right' : 'text-center'}
                                                            ${header.column.id.includes('total') ? 'bg-muted/30' : ''}
                                                        `}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header.column.columnDef.footer,
                                                                    header.getContext()
                                                                )}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </tfoot>
                                </Table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-4 py-4 border-t bg-background z-20">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    {table.getFilteredRowModel().rows.length} Kabupaten
                                </div>
                                <div className="flex items-center space-x-6 lg:space-x-8">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm font-medium">Rows per page</p>
                                        <Select
                                            value={`${table.getState().pagination.pageSize}`}
                                            onValueChange={(value) => {
                                                table.setPageSize(Number(value))
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                                        {table.getPageCount()}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() => table.setPageIndex(0)}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to first page</span>
                                            <ChevronsLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => table.previousPage()}
                                            disabled={!table.getCanPreviousPage()}
                                        >
                                            <span className="sr-only">Go to previous page</span>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-8 w-8 p-0"
                                            onClick={() => table.nextPage()}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to next page</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="hidden h-8 w-8 p-0 lg:flex"
                                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                            disabled={!table.getCanNextPage()}
                                        >
                                            <span className="sr-only">Go to last page</span>
                                            <ChevronsRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
