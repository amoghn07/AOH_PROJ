export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson: string;
  contractId: string;
  paymentTerms: string;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}

export interface VendorContract {
  id: string;
  vendorId: string;
  contractNumber: string;
  effectiveDate: Date;
  expirationDate: Date;
  terms: ContractTerms;
  paymentTerms: PaymentTerms;
  documentUrl?: string;
}

export interface ContractTerms {
  serviceDescription: string;
  scope: string;
  liabilities: string;
  disputeResolution: string;
  specialClauses: string[];
}

export interface PaymentTerms {
  termsName: string; // e.g., "Net 30", "2/10 Net 30"
  standardDays: number;
  earlyPaymentDiscount?: number;
  discountDays?: number;
  lateFeePercentage?: number;
}
