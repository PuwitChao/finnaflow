import { describe, it, expect } from 'vitest';
import { simplifyDescription } from '../statementParser';

describe('simplifyDescription', () => {
  it('extracts merchant after "เพื่อชําระ"', () => {
    const text = '14,824.32 K PLUS เพื่อชําระ Ref X2845 GrabPay Wallet';
    const result = simplifyDescription(text);
    expect(result.name).toBe('GrabPay Wallet');
  });

  it('extracts merchant after "โอนไป" and redacts name', () => {
    const text = 'K PLUS โอนไป TTB X9999 MR SOMCHAI DEEJAIDEE';
    const result = simplifyDescription(text);
    expect(result.name).toBe('Personal Transfer');
  });

  it('extracts merchant after "จาก" and redacts name and symbols', () => {
    const text = 'K PLUS จาก X9999 น.ส. สมหญิง รักดี++';
    const result = simplifyDescription(text);
    expect(result.name).toBe('Personal Transfer');
  });


  it('cleans up Ref IDs, account fragments, bank prefixes, and extra symbols', () => {
    const text = 'ชําระเงิน K PLUS เพื่อชําระ Ref X8608 GULF BINANCE';
    const result = simplifyDescription(text);
    expect(result.name).toBe('GULF BINANCE');
  });

  it('truncates strings longer than 25 characters', () => {
    const text = 'เพื่อชําระ LONG MERCHANT NAME VERY VERY VERY LONG';
    const result = simplifyDescription(text);
    expect(result.name).toBe('LONG MERCHANT NAME VERY V...');
    expect(result.name.length).toBeLessThanOrEqual(28); // 25 + 3 for "..."
  });

  it('returns "Other Transaction" when name becomes empty', () => {
    const text = 'K PLUS Ref X1234';
    const result = simplifyDescription(text);
    expect(result.name).toBe('Other Transaction');
  });
});
