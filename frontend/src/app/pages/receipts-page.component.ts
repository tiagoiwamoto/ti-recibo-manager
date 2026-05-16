import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Receipt, ReceiptForm } from '../core/models';
import { amountToWords, dateToWords } from '../core/receipt-utils';
import { formatByDocumentType } from '../core/document-mask';

@Component({
  selector: 'app-receipts-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receipts-page.component.html'
})
export class ReceiptsPageComponent implements OnInit {
  @ViewChild('previewFrame') previewFrame?: ElementRef<HTMLIFrameElement>;

  receipts: Receipt[] = [];
  search = '';
  loading = false;
  error = '';
  previewOpen = false;
  previewHtml = '';
  receiptForm: ReceiptForm = this.emptyForm();
  amountInput = '';

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.amountInput = this.formatCurrencyFromNumber(this.receiptForm.amount);
    void this.load();
  }

  emptyForm(): ReceiptForm {
    return {
      id: null,
      receiptType: 'CREDITOR',
      amount: 0,
      payerName: '',
      payerDocument: '',
      payerDocumentType: 'CPF',
      amountInWords: '',
      reference: '',
      notes: '',
      issueDate: '',
      place: '',
      issueDateText: '',
      receiverName: '',
      receiverDocument: '',
      receiverDocumentType: 'CPF'
    };
  }

  reset(): void {
    this.receiptForm = this.emptyForm();
    this.amountInput = this.formatCurrencyFromNumber(this.receiptForm.amount);
    this.closePreview();
  }

  editReceipt(receipt: Receipt): void {
    this.receiptForm = this.toForm(receipt);
    this.amountInput = this.formatCurrencyFromNumber(this.receiptForm.amount);
    this.applyPayerDocumentMask();
    this.applyReceiverDocumentMask();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.receipts = await firstValueFrom(this.api.listReceipts(this.search));
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.receiptForm.amount = this.parseCurrencyToNumber(this.amountInput);
      const { id, ...payload } = this.receiptForm;
      const requestPayload = {
        ...payload,
        amount: Number(payload.amount)
      };

      const saved = this.receiptForm.id
        ? await firstValueFrom(this.api.updateReceipt(this.receiptForm.id, requestPayload as ReceiptForm))
        : await firstValueFrom(this.api.createReceipt(requestPayload as ReceiptForm));

      this.receiptForm = this.toForm(saved);
      this.amountInput = this.formatCurrencyFromNumber(this.receiptForm.amount);
      await this.load();
      await this.preview(saved.id, true);
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Excluir este recibo?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await firstValueFrom(this.api.deleteReceipt(id));
      if (this.receiptForm.id === id) {
        this.reset();
      }
      await this.load();
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async preview(id: string | null | undefined, openModal = false): Promise<void> {
    if (!id) {
      return;
    }

    try {
      const response = await firstValueFrom(this.api.previewReceipt(id));
      this.previewHtml = response.html;
      if (openModal) {
        this.previewOpen = true;
      }
    } catch (error) {
      this.error = this.describeError(error);
    }
  }

  closePreview(): void {
    this.previewOpen = false;
  }

  printPreview(): void {
    this.previewFrame?.nativeElement.contentWindow?.print();
  }

  syncAmountInWords(): void {
    this.receiptForm.amountInWords = amountToWords(this.receiptForm.amount);
  }

  onAmountInputChange(value: string): void {
    this.amountInput = this.formatCurrencyInput(value);
    this.receiptForm.amount = this.parseCurrencyToNumber(this.amountInput);
    this.syncAmountInWords();
  }

  syncIssueDateText(): void {
    this.receiptForm.issueDateText = dateToWords(this.receiptForm.issueDate);
  }

  trackById(_: number, receipt: Receipt): string {
    return receipt.id;
  }

  applyPayerDocumentMask(): void {
    this.receiptForm.payerDocument = formatByDocumentType(this.receiptForm.payerDocument, this.receiptForm.payerDocumentType);
  }

  onPayerDocumentTypeChange(): void {
    this.applyPayerDocumentMask();
  }

  applyReceiverDocumentMask(): void {
    this.receiptForm.receiverDocument = formatByDocumentType(this.receiptForm.receiverDocument, this.receiptForm.receiverDocumentType);
  }

  onReceiverDocumentTypeChange(): void {
    this.applyReceiverDocumentMask();
  }

  private toForm(receipt: Receipt): ReceiptForm {
    return {
      id: receipt.id,
      receiptType: receipt.receiptType ?? 'CREDITOR',
      amount: Number(receipt.amount ?? 0),
      payerName: receipt.payerName ?? '',
      payerDocument: receipt.payerDocument ?? '',
      payerDocumentType: receipt.payerDocumentType ?? 'CPF',
      amountInWords: receipt.amountInWords ?? amountToWords(receipt.amount),
      reference: receipt.reference ?? '',
      notes: receipt.notes ?? '',
      issueDate: receipt.issueDate ?? '',
      place: receipt.place ?? '',
      issueDateText: receipt.issueDateText ?? dateToWords(receipt.issueDate),
      receiverName: receipt.receiverName ?? '',
      receiverDocument: receipt.receiverDocument ?? '',
      receiverDocumentType: receipt.receiverDocumentType ?? 'CPF'
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
