import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NbButtonModule, NbCardModule, NbDialogRef, NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-receipt-preview-dialog',
  standalone: true,
  imports: [NbCardModule, NbButtonModule, NbIconModule],
  template: `
    <nb-card class="dialog-card preview-card">
      <nb-card-header>
        <div class="dialog-header">
          <h5>Preview do recibo</h5>
          <button nbButton ghost size="small" type="button" (click)="close()" aria-label="Fechar">
            <nb-icon icon="close-outline"></nb-icon>
          </button>
        </div>
      </nb-card-header>
      <nb-card-body>
        <div class="receipt-preview-container" [innerHTML]="safeHtml"></div>
      </nb-card-body>
      <nb-card-footer>
        <div class="dialog-actions">
          <button nbButton status="basic" type="button" (click)="close()">Fechar</button>
          <button nbButton status="primary" type="button" (click)="print()">Imprimir recibo</button>
        </div>
      </nb-card-footer>
    </nb-card>
  `
})
export class ReceiptPreviewDialogComponent implements OnInit {
  @Input() html = '';

  safeHtml: SafeHtml = '';

  constructor(
    private readonly dialogRef: NbDialogRef<ReceiptPreviewDialogComponent>,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(this.html);
  }

  print(): void {
    const printWindow = window.open('', '_blank');
    if (printWindow && this.html) {
      printWindow.document.write(this.html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
