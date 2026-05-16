export type DocumentType = 'CPF' | 'CNPJ';
export type ReceiptType = 'CREDITOR' | 'DEBTOR';

export interface DashboardSummary {
  clientCount: number;
  receiptCount: number;
  totalReceiptAmount: number;
  recentReceipts: Receipt[];
}

export interface Client {
  id: string;
  name: string;
  document: string;
  documentType: DocumentType;
  rg?: string | null;
  birthDate?: string | null;
  driverLicense?: string | null;
  address: string;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  notes?: string | null;
}

export interface ClientForm {
  id: string | null;
  name: string;
  document: string;
  documentType: DocumentType;
  rg: string;
  birthDate: string;
  driverLicense: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}

export interface Receipt {
  id: string;
  receiptType: ReceiptType;
  amount: number;
  payerName: string;
  payerDocument: string;
  payerDocumentType: DocumentType;
  amountInWords?: string | null;
  reference: string;
  notes?: string | null;
  issueDate: string;
  place: string;
  issueDateText?: string | null;
  receiverName: string;
  receiverDocument: string;
  receiverDocumentType: DocumentType;
}

export interface ReceiptForm {
  id: string | null;
  receiptType: ReceiptType;
  amount: number;
  payerName: string;
  payerDocument: string;
  payerDocumentType: DocumentType;
  amountInWords: string;
  reference: string;
  notes: string;
  issueDate: string;
  place: string;
  issueDateText: string;
  receiverName: string;
  receiverDocument: string;
  receiverDocumentType: DocumentType;
}

export interface AppConfig {
  id?: number;
  issuerName: string;
  issuerDocument: string;
  issuerDocumentType: DocumentType;
  city: string;
  logoPath: string;
  receiptTemplate: string;
}

export interface ReceiptPreviewResponse {
  html: string;
}

