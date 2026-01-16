import { Vendor, VendorContract, PaymentTerms, ContractTerms } from '../types/vendor';

export const sampleVendors: Vendor[] = [
  {
    id: 'VENDOR-001',
    name: 'TechSupply Co.',
    email: 'billing@techsupply.com',
    contactPerson: 'John Smith',
    contractId: 'CONTRACT-2024-001',
    paymentTerms: 'Net 30',
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'VENDOR-002',
    name: 'Office Solutions Inc.',
    email: 'accounts@officesolutions.com',
    contactPerson: 'Sarah Johnson',
    contractId: 'CONTRACT-2024-002',
    paymentTerms: 'Net 45',
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: 'VENDOR-003',
    name: 'Logistics Express',
    email: 'finance@logisticsexpress.com',
    contactPerson: 'Mike Chen',
    contractId: 'CONTRACT-2024-003',
    paymentTerms: '2/10 Net 30',
    currency: 'USD',
    status: 'active',
    createdAt: new Date('2024-02-20'),
  },
];

export const sampleContracts: VendorContract[] = [
  {
    id: 'CONTRACT-2024-001',
    vendorId: 'VENDOR-001',
    contractNumber: 'TSC-2024-001',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2025-12-31'),
    terms: {
      serviceDescription: 'Supply of IT equipment and accessories',
      scope: 'Computers, monitors, keyboards, mice, networking equipment',
      liabilities: 'Vendor responsible for defective goods within 30 days',
      disputeResolution: 'Initial contact with Account Manager, escalate to Legal if unresolved after 5 business days',
      specialClauses: [
        'Early Payment Discount: 2% off if paid within 10 days',
        'Volume discount applies: 5% off for orders over $10,000',
        'Returns must be approved within 14 days of receipt',
      ],
    },
    paymentTerms: {
      termsName: 'Net 30',
      standardDays: 30,
      earlyPaymentDiscount: 2,
      discountDays: 10,
      lateFeePercentage: 1.5,
    },
  },
  {
    id: 'CONTRACT-2024-002',
    vendorId: 'VENDOR-002',
    contractNumber: 'OSI-2024-001',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2025-12-31'),
    terms: {
      serviceDescription: 'Office furniture and supplies',
      scope: 'Desks, chairs, filing cabinets, printer paper, office supplies',
      liabilities: 'Vendor responsible for damaged goods upon delivery',
      disputeResolution: 'Email disputes to disputes@officesolutions.com, response within 3 business days',
      specialClauses: [
        'Free shipping on orders over $5,000',
        'Custom furniture orders are non-refundable',
        'Bulk supply agreements have quarterly pricing adjustments',
      ],
    },
    paymentTerms: {
      termsName: 'Net 45',
      standardDays: 45,
      earlyPaymentDiscount: 1,
      discountDays: 15,
    },
  },
  {
    id: 'CONTRACT-2024-003',
    vendorId: 'VENDOR-003',
    contractNumber: 'LE-2024-001',
    effectiveDate: new Date('2024-01-01'),
    expirationDate: new Date('2025-12-31'),
    terms: {
      serviceDescription: 'Shipping and logistics services',
      scope: 'Domestic and international shipping, warehousing, inventory management',
      liabilities: 'Liability capped at invoice value; insurance available at additional cost',
      disputeResolution: 'Escalate to Finance Manager for amounts over $1,000',
      specialClauses: [
        'Fuel surcharge may apply based on market rates',
        'Weight discrepancies: vendor reconciles monthly with actual shipments',
        'Expedited shipping available at 25% premium',
      ],
    },
    paymentTerms: {
      termsName: '2/10 Net 30',
      standardDays: 30,
      earlyPaymentDiscount: 2,
      discountDays: 10,
      lateFeePercentage: 2,
    },
  },
];

export function getVendorById(vendorId: string): Vendor | undefined {
  return sampleVendors.find((v) => v.id === vendorId);
}

export function getContractByVendorId(vendorId: string): VendorContract | undefined {
  return sampleContracts.find((c) => c.vendorId === vendorId);
}

export function getVendorByEmail(email: string): Vendor | undefined {
  const normalized = email.toLowerCase();
  return sampleVendors.find((v) => v.email.toLowerCase() === normalized);
}

export function formatVendorContext(vendor: Vendor): string {
  return `
Vendor Name: ${vendor.name}
Contact Email: ${vendor.email}
Primary Contact: ${vendor.contactPerson}
Status: ${vendor.status}
Payment Terms: ${vendor.paymentTerms}
`;
}

export function formatContractContext(contract: VendorContract): string {
  const specialClauses = contract.terms.specialClauses
    .map((clause, idx) => `  ${idx + 1}. ${clause}`)
    .join('\n');

  return `
Contract Number: ${contract.contractNumber}
Effective Date: ${contract.effectiveDate.toISOString().split('T')[0]}
Expiration Date: ${contract.expirationDate.toISOString().split('T')[0]}

Service Description: ${contract.terms.serviceDescription}
Scope: ${contract.terms.scope}

Payment Terms: ${contract.paymentTerms.termsName}
- Standard Payment Days: ${contract.paymentTerms.standardDays}
- Early Payment Discount: ${contract.paymentTerms.earlyPaymentDiscount || 'None'}${
    contract.paymentTerms.discountDays ? `% if paid within ${contract.paymentTerms.discountDays} days` : ''
  }
- Late Fee: ${contract.paymentTerms.lateFeePercentage || 'None'}%

Vendor Liabilities: ${contract.terms.liabilities}

Dispute Resolution Process: ${contract.terms.disputeResolution}

Special Clauses:
${specialClauses}
`;
}
