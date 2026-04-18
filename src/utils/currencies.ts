export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export const getCurrencySymbol = (code: string): string => {
    return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || '$';
};

/**
 * THB-relative scale factors used to localise template amounts.
 * These are approximate ratios for display purposes only — not real-time exchange rates.
 */
export const CURRENCY_SCALE: Record<string, number> = {
    THB: 1, USD: 0.028, EUR: 0.026, GBP: 0.022, JPY: 4.2, CNY: 0.2,
    INR: 2.35, KRW: 37.5, AUD: 0.043, CAD: 0.039, SGD: 0.038,
};

/**
 * Scales a THB-denominated template amount to the target currency with
 * "nice" rounding for readability. Not a financial conversion tool.
 */
export const scaleTemplateAmount = (thbAmount: number, currency: string): number => {
    const scale = CURRENCY_SCALE[currency] ?? 0.028;
    const raw = thbAmount * scale;
    if (raw < 10) return Math.round(raw * 100) / 100;
    if (raw < 100) return Math.round(raw / 5) * 5;
    if (raw < 1000) return Math.round(raw / 50) * 50;
    if (raw < 10000) return Math.round(raw / 500) * 500;
    return Math.round(raw / 5000) * 5000;
};
