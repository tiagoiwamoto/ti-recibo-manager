import { Directive, HostListener, Input, OnChanges, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';
import { DocumentType } from './models';
import { formatByDocumentType } from './document-mask';

/**
 * Applies a live CPF/CNPJ mask to an input bound to ngModel/FormControl.
 * Reformats automatically when the bound document type changes.
 *
 * Usage: <input [(ngModel)]="form.document" [appDocumentMask]="form.documentType">
 */
@Directive({
  selector: '[appDocumentMask]',
  standalone: true
})
export class DocumentMaskDirective implements OnChanges {
  @Input('appDocumentMask') documentType: DocumentType = 'CPF';

  constructor(@Optional() private readonly ngControl: NgControl) {}

  ngOnChanges(): void {
    const control = this.ngControl?.control;
    if (control && control.value) {
      control.setValue(formatByDocumentType(control.value, this.documentType), { emitEvent: false });
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatByDocumentType(input.value, this.documentType);
    input.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: false });
  }
}
