/**
 * Statement Parser Utility
 * Extracts financial transactions from raw text pasted from bank apps and statements.
 */

import { FinanceItem, Frequency } from '../store/useFinanceStore';

export interface ParsedTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    longDescription: string;
    raw: string;
}

const CATEGORY_MAP: Record<string, string> = {
    'GRAB': 'Transportation',
    'LINEMAN': 'Food & Delivery',
    'BOLT': 'Transportation',
    'SHOPEE': 'Shopping',
    'LAZADA': 'Shopping',
    '7-ELEVEN': 'Groceries',
    'LOTUS': 'Groceries',
    'CJ EXPRESS': 'Groceries',
    'MK RESTAURANT': 'Dining Out',
    'SUKI': 'Dining Out',
    'SHABU': 'Dining Out',
    'CAFE AMAZON': 'Dining Out',
    'STARBUCKS': 'Dining Out',
    'AIS': 'Bills & Utilities',
    'TRUE': 'Bills & Utilities',
    'DTAC': 'Bills & Utilities',
    'FINNOMENA': 'Investment',
    'BINANCE': 'Investment',
    'GULF': 'Investment',
    'ELECTRICITY': 'Bills & Utilities',
    'WATER': 'Bills & Utilities',
    'PEA': 'Bills & Utilities',
    'MEA': 'Bills & Utilities',
};

// Thai Keywords for Type Detection
const INCOME_KEYWORDS = ['รับโอน', 'ฝากเงิน', 'เงินโอน', 'RECEIVE', 'DEPOSIT'];
const EXPENSE_KEYWORDS = ['ชําระเงิน', 'โอนเงิน', 'โอนไป', 'หักบัญชี', 'ค่าธรรมเนียม', 'ถอนเงิน', 'ซื้อหน่วยลงทุน', 'PAYMENT', 'TRANSFER', 'WITHDRAW', 'DEBIT', 'FEE'];
const IGNORE_KEYWORDS = ['ยอดยกมา', 'BALANCE BROUGHT FORWARD'];

/**
 * Heuristic 1: Credit Card style (ttb/standard)
 * Pattern: DD/MM/YYYY DD/MM/YYYY DESCRIPTION AMOUNT
 */
const CC_PATTERN = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d,]+\.\d{2})/g;

/**
 * Heuristic 2: Bank App (K-PLUS/Mobile)
 * Pattern: DD-MM-YY HH:mm TYPE [AMOUNT] [BALANCE] DETAILS
 */
const MOBILE_PATTERN = /(\d{2}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s+([\d,]+\.\d{2})?\s+(.+)/g;

/**
 * Suggests a category based on the description
 */
export const suggestCategory = (description: string): string => {
    const desc = description.toUpperCase();
    for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
        if (desc.includes(keyword)) {
            return category;
        }
    }
    return 'Other';
};

/**
 * Detects if a description implies an Income or Expense
 * Revised: Defaults to 'expense' for K-Bank style unless 'รับโอน' is found.
 */
const detectType = (text: string, amount: number, isIndentedRight: boolean = false): 'income' | 'expense' => {
    const normalizedText = text.normalize('NFC').toUpperCase();
    
    // Indentation Sensing: In some bank layouts, a right-shifted column indicates a deposit
    if (isIndentedRight) return 'income';

    if (INCOME_KEYWORDS.some(k => normalizedText.includes(k.normalize('NFC').toUpperCase()))) return 'income';
    if (EXPENSE_KEYWORDS.some(k => normalizedText.includes(k.normalize('NFC').toUpperCase()))) return 'expense';
    
    if (amount < 0) return 'expense';
    return 'expense';
};

/**
 * Simplifies a long bank description into a clean title and removes sensitive info.
 */
export const simplifyDescription = (text: string): { name: string, description: string } => {
    const raw = text.normalize('NFC');
    let simplified = raw;

    // 1. Common Utility/Merchant Extraction
    const merchantMatch = raw.match(/(?:เพื่อชําระ|ชําระ|PAYMENT TO|TO)\s+(?:REF\s+\S+\s+)?(.+)/i);
    if (merchantMatch) simplified = merchantMatch[1];

    const transferToMatch = raw.match(/(?:โอนไป|TRANSFER TO)\s+(?:พร้อมเพย์\s+\S+\s+)?(.+)/i);
    if (transferToMatch) simplified = transferToMatch[1];

    const fromMatch = raw.match(/(?:จาก|FROM)\s+(?:พร้อมเพย์\s+\S+\s+)?(.+)/i);
    if (fromMatch) simplified = fromMatch[1];

    // 2. Privacy Cleanup
    // Remove Ref IDs (Ref X1234)
    simplified = simplified.replace(/Ref\s+X\d+/gi, '');
    // Remove Account fragments (X1234)
    simplified = simplified.replace(/X\d+/g, '');
    // Remove Bank prefixes
    simplified = simplified.replace(/K PLUS|TTB|SCB|ธนาคาร/gi, '');
    // Redact Personal Names (Pattern: Mr./Ms. or Thai prefixes)
    simplified = simplified.replace(/(?:MR|MRS|MS|นาย|นาง|น\.ส\.)\s+[\u0E00-\u0E7F\w\s]+/gi, 'Personal Transfer');
    // Remove extra symbols like ++ or trailing spaces
    simplified = simplified.replace(/\+\+|=/g, '').trim();

    // 3. Brand Mapping Cleanup (If we found a long string like "GULF BINANCE", it might already be in CATEGORY_MAP)
    // We already do this via suggestCategory, but let's Ensure names are short.
    if (simplified.length > 25) {
        simplified = simplified.substring(0, 25).trim() + '...';
    }

    return {
        name: simplified || 'Other Transaction',
        description: raw
    };
};

/**
 * Cleans numeric strings (removes commas)
 */
const cleanAmount = (amt: string): number => {
    return parseFloat(amt.replace(/,/g, ''));
};

/**
 * Parses unstructured text and returns a list of transactions
 */
export const parseStatement = (text: string): ParsedTransaction[] => {
    const results: ParsedTransaction[] = [];

    // Try Credit Card Pattern first
    let match;
    while ((match = CC_PATTERN.exec(text)) !== null) {
        const amount = cleanAmount(match[4]);
        const { name, description } = simplifyDescription(match[3]);
        results.push({
            date: match[1],
            description: name,
            longDescription: description,
            amount: Math.abs(amount),
            type: detectType(description, amount),
            category: suggestCategory(description),
            raw: match[0]
        });
    }

    // Try Mobile App Pattern
    if (results.length === 0) {
        // We use split to see if the user preserved spaces for "Indentation Sensing"
        const lines = text.split('\n');
        lines.forEach(line => {
            // Check for Mobile pattern manually per line to detect spaces
            const mobileMatch = line.match(/^(\d{2}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})/);
            if (mobileMatch) {
                const date = mobileMatch[1];
                const time = mobileMatch[2];
                const typeText = mobileMatch[3].trim();
                const amountStr = mobileMatch[4];
                const amount = cleanAmount(amountStr);
                
                // Detect Indentation: Check if there's a big gap after typeText or if amount is preceded by many spaces
                // K-PLUS PDF copy-paste often has significant spaces for deposits
                const isIndented = line.includes('      ' + amountStr); // 6+ spaces indicates a shift

                const rest = line.replace(mobileMatch[0], '').trim();
                if (IGNORE_KEYWORDS.some(k => typeText.includes(k) || rest.includes(k))) return;

                const { name, description } = simplifyDescription(`${typeText}: ${rest}`);
                results.push({
                    date,
                    description: name,
                    longDescription: description,
                    amount: Math.abs(amount),
                    type: detectType(description, amount, isIndented),
                    category: suggestCategory(description),
                    raw: line
                });
            }
        });
    }

    // Fallsback: Line-by-line simple parsing
    if (results.length === 0) {
        const lines = text.split('\n');
        lines.forEach(line => {
            const row = line.trim();
            if (!row || row.length < 10) return;
            if (IGNORE_KEYWORDS.some(k => row.includes(k))) return;

            const amountMatch = row.match(/(-?[\d,]+\.\d{2})$/);
            if (amountMatch) {
                const amount = cleanAmount(amountMatch[1]);
                const rawDesc = row.replace(amountMatch[1], '').trim();
                const { name, description } = simplifyDescription(rawDesc);
                results.push({
                    date: new Date().toLocaleDateString(),
                    description: name,
                    longDescription: description,
                    amount: Math.abs(amount),
                    type: detectType(description, amount),
                    category: suggestCategory(description),
                    raw: row
                });
            }
        });
    }

    return results;
};
