import { Component, Input } from '@angular/core';
import { NbButtonModule, NbCardModule, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NbCardModule, NbButtonModule],
  template: `
    <nb-card class="dialog-card" style="width: min(26rem, calc(100vw - 2rem));">
      <nb-card-header>Confirmar</nb-card-header>
      <nb-card-body>{{ message }}</nb-card-body>
      <nb-card-footer>
        <div class="dialog-actions">
          <button nbButton status="basic" type="button" (click)="close(false)">Cancelar</button>
          <button nbButton status="danger" type="button" (click)="close(true)">Confirmar</button>
        </div>
      </nb-card-footer>
    </nb-card>
  `
})
export class ConfirmDialogComponent {
  @Input() message = 'Confirmar esta acao?';

  constructor(private readonly dialogRef: NbDialogRef<ConfirmDialogComponent>) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}
