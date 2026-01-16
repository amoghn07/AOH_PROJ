export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: any): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

export function extractInvoiceNumbers(text: string): string[] {
  const invoiceRegex = /(?:Invoice\s*#?|INV-?|#)[\s]*([\w\-]+)/gi;
  const matches = text.match(invoiceRegex) || [];
  return matches.map((match) => {
    const extracted = match.replace(/^(Invoice|INV|#)[\s#\-]*/i, '').trim();
    return extracted;
  });
}

export function extractAmounts(text: string): number[] {
  const amountRegex = /\$\s*([\d,]+\.?\d*)/g;
  const matches = text.match(amountRegex) || [];
  return matches
    .map((match) => {
      const number = match.replace(/[\$,\s]/g, '');
      return parseFloat(number);
    })
    .filter((num) => !isNaN(num) && num > 0);
}

export function generateCaseId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CASE-${timestamp}-${random}`;
}
