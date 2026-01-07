export interface District {
    id: number;
    name: string;
}

export interface Proccode {
    id: number;
    code: string;
    name: string;
    source: string;
    template_id?: number;
}

export interface MatrixCell {
    trx: number;
    nominal: number;
}

export interface MatrixData {
    [key: string]: MatrixCell; // key format: "{district_id}_{proccode_id}"
}

export interface ConsolidationItem {
    id: number;
    transaction_date: string;
    nominal: number;
    raw_data: any;
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};
