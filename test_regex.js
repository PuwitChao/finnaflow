
const text = `
01-02-26 ยอดยกมา 15,723.32
01-02-26 00:37 ชําระเงิน 500.00 15,223.32 K PLUS เพื่อชําระ Ref X8608 GULF BINANCE
01-02-26 17:22 ชําระเงิน 399.00 14,824.32 K PLUS เพื่อชําระ Ref X2845 GrabPay Wallet
02-02-26 01:03 13,824.32 K PLUS โอนไป TTB X2752 MR PUWIT CHAOWANAP

++

โอนเงิน 1,000.00

02-02-26 10:00 รับโอนเงิน 100.00 13,924.32 K PLUS จาก X0216 น.ส. ณิชนันท์ กาศิ++
03-02-26 10:25 11,586.32 Online Direct Debit โอนไป X2655 บัญชีซื้อหน่วยลงทุ++ Ref X0452
Xรีชา RDD26020 FINNOMENA MUTUAL

หักบัญชี 1,000.00
`;

const MOBILE_PATTERN = /(\d{2}-\d{2}-\d{2})\s+(\d{2}:\d{2})\s+(.+?)\s+(-?[\d,]+\.\d{2})\s+([\d,]+\.\d{2})?\s+(.+)/g;
const CC_PATTERN = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+(-?[\d,]+\.\d{2})/g;

console.log("Testing MOBILE_PATTERN:");
let match;
while ((match = MOBILE_PATTERN.exec(text)) !== null) {
    console.log("Matched:", match[0]);
    console.log("  Date:", match[1]);
    console.log("  Type:", match[3]);
    console.log("  Amount:", match[4]);
}

// Fallback logic check
const lines = text.split('\n');
console.log("\nTesting Fallback:");
lines.forEach(line => {
    const row = line.trim();
    if (!row || row.length < 10) return;
    const amountMatch = row.match(/(-?[\d,]+\.\d{2})$/);
    if (amountMatch) {
         console.log("Fallback match:", row, "-> Amount:", amountMatch[1]);
    }
});
