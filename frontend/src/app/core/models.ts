export type DocumentType = 'CPF' | 'CNPJ';
export type ReceiptType = 'CREDITOR' | 'DEBTOR';
export type ReceiptTemplate =
  | 'Moderno'
  | 'Simples'
  | 'SimplesDuplo'
  | 'Aurora'
  | 'Atlas'
  | 'Horizonte';

export interface ReceiptTemplateOption {
  value: ReceiptTemplate;
  label: string;
  description: string;
}

export const RECEIPT_TEMPLATES: ReceiptTemplateOption[] = [
  { value: 'Moderno', label: 'Moderno', description: 'Layout completo com resumo e duas assinaturas.' },
  { value: 'Simples', label: 'Simples', description: 'Recibo enxuto com uma assinatura (recebedor).' },
  { value: 'SimplesDuplo', label: 'Simples duplo', description: 'Recibo enxuto com assinaturas de pagador e recebedor.' },
  { value: 'Aurora', label: 'Aurora', description: 'Visual editorial com destaque para valor e bloco de assinaturas elegante.' },
  { value: 'Atlas', label: 'Atlas', description: 'Composicao executiva com grade de dados e assinaturas separadas por fluxo.' },
  { value: 'Horizonte', label: 'Horizonte', description: 'Layout contemporaneo com faixa superior e assinaturas amplas no rodape.' }
];

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
  template?: ReceiptTemplate | null;
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
  template: ReceiptTemplate;
}

export interface AppConfig {
  id?: number;
  issuerName: string;
  issuerDocument: string;
  issuerDocumentType: DocumentType;
  city: string;
  logoPath: string;
  receiptTemplate: ReceiptTemplate;
}

export interface ReceiptPreviewResponse {
  html: string;
}

