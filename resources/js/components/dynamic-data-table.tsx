import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getValueByPath, formatValue } from '@/lib/data-utils';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Helper to remove thousands separator (dots) from Indonesian formatted numbers
const cleanNumberString = (str: string) => str.replace(/\./g, '');

interface ColumnMapping {
    label: string;
    path: string;
    type: 'string' | 'currency' | 'date' | 'number';
    substring_start?: number;
    substring_length?: number;
}

interface DynamicDataTableProps {
    data: any[];
    columns: ColumnMapping[];
    title?: string;
    description?: string;
    headerAction?: React.ReactNode;
    renderRowActions?: (row: any) => React.ReactNode;
    rowClassName?: (row: any) => string;
}

export function DynamicDataTable({ data, columns, title, description, headerAction, renderRowActions, rowClassName }: DynamicDataTableProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    if (!data || data.length === 0) {
        return (
            <Card>
                <CardHeader>
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Tidak ada data untuk ditampilkan
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Filter data based on search term
    const filteredData = data.filter((row) => {
        if (!searchTerm) return true;
        const lowerSearchTerm = searchTerm.toLowerCase();

        return columns.some((column) => {
            const rawValue = getValueByPath(
                row,
                column.path,
                column.substring_start,
                column.substring_length
            );

            // Check raw value
            if (String(rawValue).toLowerCase().includes(lowerSearchTerm)) {
                return true;
            }

            // Check formatted value
            const formattedValue = formatValue(rawValue, column.type);
            if (String(formattedValue).toLowerCase().includes(lowerSearchTerm)) {
                return true;
            }

            // Special case for numbers: check without thousands separator
            if (column.type === 'currency' || column.type === 'number') {
                const cleanedValue = cleanNumberString(String(formattedValue));
                if (cleanedValue.toLowerCase().includes(lowerSearchTerm)) {
                    return true;
                }
            }

            return false;
        });
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 space-y-0 md:flex-row md:items-start md:justify-between">
                <div className="grid gap-1">
                    {title && <CardTitle>{title}</CardTitle>}
                    {description && <CardDescription>{description}</CardDescription>}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Cari data..."
                            className="w-full pl-8 sm:w-[250px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">#</TableHead>
                                {columns.map((column, index) => (
                                    <TableHead key={index}>{column.label}</TableHead>
                                ))}
                                {renderRowActions && <TableHead className="text-right">Aksi</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((row, index) => {
                                    const rowIndex = startIndex + index;
                                    return (
                                        <TableRow key={rowIndex} className={rowClassName ? rowClassName(row) : ''}>
                                            <TableCell className="font-medium">{rowIndex + 1}</TableCell>
                                            {columns.map((column, colIndex) => {
                                                const rawValue = getValueByPath(
                                                    row,
                                                    column.path,
                                                    column.substring_start,
                                                    column.substring_length
                                                );
                                                const formattedValue = formatValue(rawValue, column.type);

                                                return (
                                                    <TableCell
                                                        key={colIndex}
                                                        className={
                                                            column.type === 'currency' || column.type === 'number'
                                                                ? 'text-right'
                                                                : ''
                                                        }
                                                    >
                                                        {formattedValue}
                                                    </TableCell>
                                                );
                                            })}
                                            {renderRowActions && (
                                                <TableCell className="text-right">
                                                    {renderRowActions(row)}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                        Tidak ada data yang cocok dengan pencarian "{searchTerm}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between px-2 pt-4">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <p className="hidden sm:block">
                            Menampilkan {Math.min(startIndex + 1, filteredData.length)} hingga {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                        </p>
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Rows per page</p>
                            <Select
                                value={`${itemsPerPage}`}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue placeholder={itemsPerPage} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[10, 25, 50, 100].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
