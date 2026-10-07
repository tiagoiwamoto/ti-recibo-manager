import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbDialogService,
  NbIconModule,
  NbInputModule,
  NbSelectModule
} from '@nebular/theme';
import { ApiService } from '../../core/api.service';
import { Client, Receipt, ReceiptForm, ReceiptTemplate, RECEIPT_TEMPLATES } from '../../core/models';
import { amountToWords, dateToWords } from '../../core/receipt-utils';
import { formatByDocumentType } from '../../core/document-mask';
import { DocumentMaskDirective } from '../../core/document-mask.directive';
import { ReceiptTemplateService } from '../../core/receipt-template.service';
import { ReceiptPreviewDialogComponent } from './receipt-preview-dialog.component';

@Component({
  selector: 'app-receipt-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentMaskDirective, NbAlertModule, NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSelectModule],
  templateUrl: './receipt-dialog.component.html'
})
export class ReceiptDialogComponent implements OnInit {
  readonly templates = RECEIPT_TEMPLATES;

  @Input() receipt?: Receipt;

  clients: Client[] = [];
  form: ReceiptForm = this.emptyForm();
  amountInput = '';
  loading = false;
  previewLoading = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly templateService: ReceiptTemplateService,
    private readonly dialogService: NbDialogService,
    private readonly dialogRef: NbDialogRef<ReceiptDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.receipt) {
      this.form = this.toForm(this.receipt);
      this.form.payerDocument = formatByDocumentType(this.form.payerDocument, this.form.payerDocumentType);
      this.form.receiverDocument = formatByDocumentType(this.form.receiverDocument, this.form.receiverDocumentType);
    }
    this.amountInput = this.formatCurrencyFromNumber(this.form.amount);
    void this.loadClients();
  }

  emptyForm(): ReceiptForm {
    return {
      id: null,
      receiptType: 'CREDITOR',
      amount: 0,
      payerName: '',
      payerDocument: '',
      payerDocumentType: 'CPF',
      payerClientId: null,
      amountInWords: '',
      reference: '',
      notes: '',
      issueDate: '',
      place: '',
      issueDateText: '',
      receiverName: '',
      receiverDocument: '',
      receiverDocumentType: 'CPF',
      receiverClientId: null,
      template: 'Padrao'
    };
  }

  async loadClients(): Promise<void> {
    try {
      this.clients = await firstValueFrom(this.api.listClients());
    } catch (error) {
      this.error = this.describeError(error);
    }
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const saved = await firstValueFrom(
        this.form.id
          ? this.api.updateReceipt(this.form.id, this.buildPayload())
          : this.api.createReceipt(this.buildPayload())
      );
      this.dialogRef.close(saved);
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async previewDraft(): Promise<void> {
    this.previewLoading = true;
    this.error = '';
    try {
      const response = await firstValueFrom(
        this.api.previewReceiptDraft(this.buildPayload(), this.form.template)
      );
      const html = this.templateService.renderReceipt(response);
      this.dialogService.open(ReceiptPreviewDialogComponent, { context: { html } });
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.previewLoading = false;
    }
  }

  onPayerClientChange(clientId: string | null): void {
    this.form.payerClientId = clientId;
    if (clientId) {
      const client = this.clients.find((c) => c.id === clientId);
      if (client) {
        this.form.payerName = client.name;
        this.form.payerDocument = formatByDocumentType(client.document, client.documentType);
        this.form.payerDocumentType = client.documentType;
      }
    }
  }

  onReceiverClientChange(clientId: string | null): void {
    this.form.receiverClientId = clientId;
    if (clientId) {
      const client = this.clients.find((c) => c.id === clientId);
      if (client) {
        this.form.receiverName = client.name;
        this.form.receiverDocument = formatByDocumentType(client.document, client.documentType);
        this.form.receiverDocumentType = client.documentType;
      }
    }
  }

  onPayerManualFocus(): void {
    this.form.payerClientId = null;
  }

  onReceiverManualFocus(): void {
    this.form.receiverClientId = null;
  }

  syncAmountInWords(): void {
    this.form.amountInWords = amountToWords(this.form.amount);
  }

  onAmountInputChange(value: string): void {
    this.amountInput = this.formatCurrencyInput(value);
    this.form.amount = this.parseCurrencyToNumber(this.amountInput);
    this.syncAmountInWords();
  }

  syncIssueDateText(): void {
    this.form.issueDateText = dateToWords(this.form.issueDate);
  }

  templateLabel(value: ReceiptTemplate | null | undefined): string {
    return this.templates.find((option) => option.value === value)?.label ?? 'Padrao';
  }

  templateDescription(value: ReceiptTemplate | null | undefined): string {
    return this.templates.find((option) => option.value === value)?.description ?? '';
  }

  clientLabel(client: Client): string {
    return `${client.name} - ${formatByDocumentType(client.document, client.documentType)}`;
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private buildPayload(): ReceiptForm {
    this.form.amount = this.parseCurrencyToNumber(this.amountInput);
    const { id, ...payload } = this.form;
    return { ...payload, amount: Number(payload.amount) } as ReceiptForm;
  }

  private toForm(receipt: Receipt): ReceiptForm {
    return {
      id: receipt.id,
      receiptType: receipt.receiptType ?? 'CREDITOR',
      amount: Number(receipt.amount ?? 0),
      payerName: receipt.payerName ?? '',
      payerDocument: receipt.payerDocument ?? '',
      payerDocumentType: receipt.payerDocumentType ?? 'CPF',
      payerClientId: receipt.payerClientId ?? null,
      amountInWords: receipt.amountInWords ?? amountToWords(receipt.amount),
      reference: receipt.reference ?? '',
      notes: receipt.notes ?? '',
      issueDate: receipt.issueDate ?? '',
      place: receipt.place ?? '',
      issueDateText: receipt.issueDateText ?? dateToWords(receipt.issueDate),
      receiverName: receipt.receiverName ?? '',
      receiverDocument: receipt.receiverDocument ?? '',
      receiverDocumentType: receipt.receiverDocumentType ?? 'CPF',
      receiverClientId: receipt.receiverClientId ?? null,
      template: receipt.template ?? 'Padrao'
    };
  }

  private formatCurrencyInput(value: string): string {
    const digits = (value ?? '').replace(/\D/g, '');
    const numeric = Number(digits || '0') / 100;
    return this.formatCurrencyFromNumber(numeric);
  }

  private formatCurrencyFromNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
  }

  private parseCurrencyToNumber(value: string): number {
    const normalized = (value ?? '')
      .replace(/[^\d,]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar o cadastro de recibos.';
  }
}
