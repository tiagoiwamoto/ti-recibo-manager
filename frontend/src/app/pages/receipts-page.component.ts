import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NbAlertModule, NbButtonModule, NbCardModule, NbDialogService, NbInputModule } from '@nebular/theme';
import { ApiService } from '../core/api.service';
import { Receipt, ReceiptTemplate, RECEIPT_TEMPLATES } from '../core/models';
import { ReceiptTemplateService } from '../core/receipt-template.service';
import { ReceiptDialogComponent } from './receipts/receipt-dialog.component';
import { ReceiptPreviewDialogComponent } from './receipts/receipt-preview-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-receipts-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NbAlertModule, NbButtonModule, NbCardModule, NbInputModule],
  templateUrl: './receipts-page.component.html'
})
export class ReceiptsPageComponent implements OnInit {
  readonly templates = RECEIPT_TEMPLATES;

  receipts: Receipt[] = [];
  search = '';
  loading = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly templateService: ReceiptTemplateService,
    private readonly dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  openCreate(): void {
    this.error = '';
    this.dialogService
      .open(ReceiptDialogComponent)
      .onClose.subscribe((saved) => void this.onSaved(saved));
  }

  editReceipt(receipt: Receipt): void {
    this.error = '';
    this.dialogService
      .open(ReceiptDialogComponent, { context: { receipt } })
      .onClose.subscribe((saved) => void this.onSaved(saved));
  }

  private async onSaved(saved: Receipt | undefined): Promise<void> {
    if (!saved) {
      return;
    }
    await this.load();
    await this.preview(saved.id, saved.template ?? 'Padrao');
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

  async preview(id: string | null | undefined, template?: string): Promise<void> {
    if (!id) {
      return;
    }

    try {
      const response = await firstValueFrom(this.api.previewReceipt(id, template));
      const html = this.templateService.renderReceipt(response);
      this.dialogService.open(ReceiptPreviewDialogComponent, { context: { html } });
    } catch (error) {
      this.error = this.describeError(error);
    }
  }

  remove(id: string): void {
    this.dialogService
      .open(ConfirmDialogComponent, { context: { message: 'Excluir este recibo?' } })
      .onClose.subscribe(async (confirmed) => {
        if (!confirmed) {
          return;
        }
        this.loading = true;
        this.error = '';
        try {
          await firstValueFrom(this.api.deleteReceipt(id));
          await this.load();
        } catch (error) {
          this.error = this.describeError(error);
        } finally {
          this.loading = false;
        }
      });
  }

  trackById(_: number, receipt: Receipt): string {
    return receipt.id;
  }

  templateLabel(value: ReceiptTemplate | null | undefined): string {
    return this.templates.find((option) => option.value === value)?.label ?? 'Padrao';
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar o cadastro de recibos.';
  }
}
