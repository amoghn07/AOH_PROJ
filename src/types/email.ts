export interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  receivedAt: Date;
  vendorId: string;
  attachments?: Attachment[];
}

export interface Attachment {
  filename: string;
  mimeType: string;
  content: Buffer;
}

export interface ParsedEmailContent {
  vendorName: string;
  vendorEmail: string;
  invoiceNumbers: string[];
  amounts: number[];
  mainComplaint: string;
  evidenceProvided: string[];
  tone: 'professional' | 'frustrated' | 'hostile' | 'neutral';
}
