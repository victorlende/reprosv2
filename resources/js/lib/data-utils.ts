/**
 * Extract value from nested object using dot notation path
 * Example: getValueByPath(data, 'Wfirstdata.2') => data.Wfirstdata[2]
 * Supports substring: getValueByPath(data, 'Wfirstdata.2', 0, 10) => data.Wfirstdata[2].substring(0, 10)
 */
export function getValueByPath(obj: any, path: string, substringStart?: number, substringLength?: number): any {
    if (!obj || !path) return null;

    const keys = path.split('.');
    let value = obj;

    for (const key of keys) {
        if (value === null || value === undefined) return null;
        value = value[key];
    }

    if (value === undefined || value === null) return null;

    // Apply substring if specified
    if (substringStart !== undefined && typeof value === 'string') {
        if (substringLength !== undefined) {
            return value.substring(substringStart, substringStart + substringLength);
        }
        return value.substring(substringStart);
    }

    return value;
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(value: any): string {
    if (value === null || value === undefined || value === '') return '-';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '-';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
}

/**
 * Format number with thousand separator
 */
export function formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '-';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return '-';

    return new Intl.NumberFormat('id-ID').format(num);
}

/**
 * Format date from dd/mm/yy to readable format
 */
export function formatDate(value: any): string {
    if (!value) return '-';

    const dateStr = value.toString();

    // Handle dd/mm/yy format
    if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        const fullYear = year.length === 2 ? `20${year}` : year;

        const date = new Date(`${fullYear}-${month}-${day}`);

        if (isNaN(date.getTime())) return dateStr;

        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }).format(date);
    }

    // Handle ISO format
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

/**
 * Format value based on type
 */
export function formatValue(value: any, type: string): string {
    switch (type) {
        case 'currency':
            return formatCurrency(value);
        case 'number':
            return formatNumber(value);
        case 'date':
            return formatDate(value);
        case 'string':
        default:
            return value !== null && value !== undefined ? value.toString() : '-';
    }
}
