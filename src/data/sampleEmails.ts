import { Email } from '../types/email';

/**
 * Sample vendor emails for testing the email analysis agent
 */
export const sampleEmails: Email[] = [
  {
    id: 'EMAIL-001',
    from: 'billing@techsupply.com',
    to: 'finance@company.com',
    subject: 'Invoice INV-2024-0004 - Underpayment Issue',
    body: `Hi,

I'm writing to bring to your attention a discrepancy with invoice INV-2024-0004 for $2,000.

We submitted this invoice on December 15, 2024, with a due date of January 14, 2025. According to our contract, we qualify for a 2% early payment discount if paid within 10 days of invoice date (by December 25). 

We notice that you have not made any payment yet, and we're now past the discount window. However, I'd like to review the contract terms with you because we believe there may be some confusion about which discounts apply to this specific order.

Could you please confirm the payment status and let me know when we can expect payment? Our normal payment terms are Net 30.

Best regards,
John Smith
TechSupply Co.
Phone: (555) 123-4567`,
    receivedAt: new Date('2025-01-15T10:30:00Z'),
    vendorId: 'VENDOR-001',
  },
  {
    id: 'EMAIL-002',
    from: 'accounts@officesolutions.com',
    to: 'finance@company.com',
    subject: 'URGENT: Invoice OSI-INV-521 - Payment Discrepancy',
    body: `Hello,

I am writing regarding Invoice OSI-INV-521 dated November 1, 2024, for $4,500 in office furniture.

We received your payment of $4,500 on December 18, 2024. However, our records indicate that this shipment included $500 worth of custom chair modifications that were explicitly agreed upon in the order, and these should have been billed separately.

According to our contract, custom modifications are non-refundable and should be charged at full price. We believe you are short by $500 and request immediate payment of this amount to settle the invoice.

This is causing issues with our accounting and we need this resolved ASAP.

Thank you,
Sarah Johnson
Office Solutions Inc.`,
    receivedAt: new Date('2025-01-14T14:15:00Z'),
    vendorId: 'VENDOR-002',
  },
  {
    id: 'EMAIL-003',
    from: 'finance@logisticsexpress.com',
    to: 'finance@company.com',
    subject: 'Question about Invoice LE-2024-456 - Fuel Surcharge',
    body: `Hi Finance Team,

Quick question about invoice LE-2024-456 for $6,000 dated December 20, 2024. 

We have a fuel surcharge clause in our contract that allows us to adjust rates based on market fluctuations. Upon review of that month's fuel costs, we believe an additional $300 fuel surcharge should have been applied to this invoice.

While you did pay the full $6,000, we'd like to clarify whether this surcharge should be invoiced separately, or if it was already factored into your payment.

Can you confirm your understanding of the fuel surcharge policy?

Thanks,
Mike Chen
Logistics Express`,
    receivedAt: new Date('2025-01-13T09:45:00Z'),
    vendorId: 'VENDOR-003',
  },
];

export function getEmailById(id: string): Email | undefined {
  return sampleEmails.find((e) => e.id === id);
}

export function formatEmailForDisplay(email: Email): string {
  return `
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}
Date: ${email.receivedAt.toISOString()}

${email.body}
`;
}
