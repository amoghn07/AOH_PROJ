export interface PaymentRecord {
  invoiceNumber: string;
  vendorId: string;
  amount: number;
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  amountPaid?: number;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
}

export const samplePaymentHistory: PaymentRecord[] = [
  {
    invoiceNumber: 'INV-2024-0001',
    vendorId: 'VENDOR-001',
    amount: 2500,
    invoiceDate: new Date('2024-12-01'),
    dueDate: new Date('2024-12-31'),
    paidDate: new Date('2024-12-25'),
    amountPaid: 2500,
    status: 'paid',
  },
  {
    invoiceNumber: 'INV-2024-0002',
    vendorId: 'VENDOR-001',
    amount: 1500,
    invoiceDate: new Date('2024-12-10'),
    dueDate: new Date('2024-12-31'),
    paidDate: new Date('2025-01-05'),
    amountPaid: 1500,
    status: 'paid',
  },
  {
    invoiceNumber: 'INV-2024-0003',
    vendorId: 'VENDOR-001',
    amount: 3000,
    invoiceDate: new Date('2025-01-01'),
    dueDate: new Date('2025-01-31'),
    paidDate: undefined,
    amountPaid: 3000,
    status: 'paid',
  },
  {
    invoiceNumber: 'INV-2024-0004',
    vendorId: 'VENDOR-001',
    amount: 2000,
    invoiceDate: new Date('2024-12-15'),
    dueDate: new Date('2025-01-14'),
    paidDate: undefined,
    status: 'pending',
  },
  // Office Solutions
  {
    invoiceNumber: 'OSI-INV-521',
    vendorId: 'VENDOR-002',
    amount: 4500,
    invoiceDate: new Date('2024-11-01'),
    dueDate: new Date('2024-12-15'),
    paidDate: new Date('2024-12-18'),
    amountPaid: 4500,
    status: 'paid',
  },
  {
    invoiceNumber: 'OSI-INV-522',
    vendorId: 'VENDOR-002',
    amount: 2800,
    invoiceDate: new Date('2024-12-01'),
    dueDate: new Date('2025-01-15'),
    paidDate: undefined,
    status: 'pending',
  },
  // Logistics Express
  {
    invoiceNumber: 'LE-2024-456',
    vendorId: 'VENDOR-003',
    amount: 6000,
    invoiceDate: new Date('2024-12-20'),
    dueDate: new Date('2025-01-19'),
    paidDate: new Date('2025-01-12'),
    amountPaid: 6000,
    status: 'paid',
  },
  {
    invoiceNumber: 'LE-2024-457',
    vendorId: 'VENDOR-003',
    amount: 4500,
    invoiceDate: new Date('2025-01-05'),
    dueDate: new Date('2025-02-04'),
    paidDate: undefined,
    status: 'pending',
  },
];

export function getPaymentHistoryByVendor(vendorId: string): PaymentRecord[] {
  return samplePaymentHistory.filter((p) => p.vendorId === vendorId);
}

export function formatPaymentHistory(vendorId: string): string {
  const history = getPaymentHistoryByVendor(vendorId);

  const records = history
    .map(
      (p) =>
        `
Invoice: ${p.invoiceNumber}
Amount: $${p.amount.toFixed(2)}
Invoice Date: ${p.invoiceDate.toISOString().split('T')[0]}
Due Date: ${p.dueDate.toISOString().split('T')[0]}
Status: ${p.status}
${p.paidDate ? `Paid Date: ${p.paidDate.toISOString().split('T')[0]}` : ''}
${p.amountPaid ? `Amount Paid: $${p.amountPaid.toFixed(2)}` : ''}
`
    )
    .join('\n---\n');

  return `Payment History for Vendor ${vendorId}:\n\n${records}`;
}
