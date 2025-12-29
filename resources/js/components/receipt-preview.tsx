import { Separator } from '@/components/ui/separator';
import { formatTerbilang } from '@/utils/terbilang';

interface ReceiptConfig {
    header: {
        title: string;
        subtitle: string;
        address: string;
        logo_left?: string | null;
        logo_right?: string | null;
    };
    body: ReceiptField[];
    footer: {
        text: string;
    };
}

interface ReceiptField {
    label: string;
    path: string;
    type: 'text' | 'currency' | 'date' | 'separator' | 'terbilang';
    align: 'left' | 'center' | 'right' | 'between';
    style: 'normal' | 'bold' | 'large';
}

interface Props {
    config: ReceiptConfig;
    data: any;
}

export function ReceiptPreview({ config, data }: Props) {
    // Helper to format values
    const formatValue = (value: any, type: string) => {
        if (!value && value !== 0) return '-';
        if (type === 'currency') {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(Number(value));
        }
        if (type === 'date') {
            return String(value);
        }
        if (type === 'terbilang') {
            return formatTerbilang(Number(value));
        }
        return String(value);
    };

    // Helper to get value from path
    const getValue = (obj: any, path: string) => {
        if (!path) return '';
        return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '';
    };

    // Helper to interpolate string with data placeholders e.g. "Kabupaten {region_name}"
    const interpolate = (template: string) => {
        if (!template) return '';
        let result = template.replace(/{([^}]+)}/g, (_, path) => {
            if (path === 'terbilang') {
                // Default to 'total' if just {terbilang} is used
                return formatTerbilang(Number(getValue(data, 'total') || 0));
            }
            if (path.startsWith('terbilang:')) {
                const actualPath = path.split(':')[1];
                const val = getValue(data, actualPath);
                return formatTerbilang(Number(val || 0));
            }

            const value = getValue(data, path.trim());
            return value !== undefined && value !== null ? String(value) : '';
        });
        return result;
    };

    return (
        <>
            <style>
                {`
                    @media print {
                        @page {
                            size: A4;
                            margin: 20mm;
                        }
                        .receipt-container {
                            width: 100% !important;
                            box-shadow: none !important;
                            margin: 0 !important;
                        }
                        .print-hide {
                            display: none !important;
                        }
                    }
                `}
            </style>
            <div className={`receipt-container bg-white p-8 shadow-md text-black text-sm leading-tight relative mx-auto transition-all ${
                // If it's A4, we use specific dimensions, otherwise default to thermal-like or let it be flexible
                'w-[210mm] min-h-[297mm]'
                }`}>
                {/* HEADER */}
                <div className="flex items-start justify-between mb-8 gap-4 border-b-2 border-double border-black pb-4">
                    {/* Left Logo */}
                    <div className="w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center">
                        {config.header.logo_left && (
                            <img src={config.header.logo_left} alt="Logo Left" className="max-w-full max-h-full object-contain" />
                        )}
                    </div>

                    {/* Center Text */}
                    <div className="flex-1 flex flex-col items-center text-center">
                        <div className="font-bold text-xl uppercase tracking-wide leading-tight">{interpolate(config.header.title) || '(Judul Instansi)'}</div>
                        <div className="font-semibold text-sm text-gray-700 mt-1">{interpolate(config.header.subtitle)}</div>
                        <div className="text-xs text-gray-500 mt-1 max-w-[80%]">{interpolate(config.header.address)}</div>
                    </div>

                    {/* Right Logo */}
                    <div className="w-[80px] h-[80px] flex-shrink-0 flex items-center justify-center">
                        {config.header.logo_right && (
                            <img src={config.header.logo_right} alt="Logo Right" className="max-w-full max-h-full object-contain" />
                        )}
                    </div>
                </div>

                {/* Body Content - Removed separate separator as border is now on header */}
                <div className="space-y-2 mb-4">
                    {config.body.map((field, idx) => {
                        if (field.type === 'separator') {
                            return <div key={idx} className="text-center text-gray-400">--- {field.label || '---'} ---</div>
                        }

                        const value = data ? formatValue(getValue(data, field.path), field.type) : '...';

                        if (field.align === 'between') {
                            return (
                                <div key={idx} className={`flex justify-between ${field.style === 'bold' ? 'font-bold' : ''} ${field.style === 'large' ? 'text-lg font-bold' : ''}`}>
                                    <span>{field.label}</span>
                                    <span>{value}</span>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className={`text-${field.align} ${field.style === 'bold' ? 'font-bold' : ''} ${field.style === 'large' ? 'text-lg font-bold' : ''}`}>
                                <div className="text-[10px] text-gray-500">{field.label}</div>
                                <div>{value}</div>
                            </div>
                        );
                    })}
                </div>

                <Separator className="my-6 border-black" />

                {/* FOOTER */}
                {config.footer.text && (
                    <div className="text-center text-sm mt-8 whitespace-pre-wrap text-gray-600 italic">
                        {interpolate(config.footer.text)}
                    </div>
                )}
            </div>
        </>
    );
}
