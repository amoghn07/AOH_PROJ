export interface Dispute {
  id: string;
  caseId: string;
  vendorId: string;
  vendorName: string;
  disputeType: 'underpayment' | 'late_payment' | 'invoice_discrepancy' | 'contract_violation' | 'other';
  amount: number;
  currency: string;
  invoiceNumber: string;
  status: 'open' | 'in_analysis' | 'pending_approval' | 'approved' | 'rejected' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface DisputeAnalysis {
  caseId: string;
  vendorId: string;
  initialAnalysis: string;
  contractReference?: string;
  paymentHistory?: string;
  confidence: 'high' | 'medium' | 'low';
  recommendedAction: 'approve_payment' | 'reject_claim' | 'partial_payment' | 'further_investigation';
  reasoning: string;
  draftResponse: string;
  requiredApprovals: string[];
}

export interface ResolutionCase {
  id: string;
  disputeId: string;
  vendorId: string;
  analysis: DisputeAnalysis;
  status: 'drafted' | 'pending_approval' | 'approved' | 'sent' | 'archived';
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  notes?: string;
}
