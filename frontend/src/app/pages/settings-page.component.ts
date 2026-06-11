import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { AppConfig, RECEIPT_TEMPLATES } from '../core/models';
import { formatByDocumentType } from '../core/document-mask';
import { DocumentMaskDirective } from '../core/document-mask.directive';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentMaskDirective],
  templateUrl: './settings-page.component.html'
})
export class SettingsPageComponent implements OnInit {
  readonly templates = RECEIPT_TEMPLATES;

  form: AppConfig = this.emptyForm();
  loading = false;
  error = '';
  message = '';

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    void this.load();
  }

  emptyForm(): AppConfig {
    return {
      issuerName: '',
      issuerDocument: '',
      issuerDocumentType: 'CPF',
      city: '',
      logoPath: '',
      receiptTemplate: 'Moderno'
    };
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.message = '';

    try {
      this.form = await firstValueFrom(this.api.getConfig());
      this.applyIssuerMask();
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.message = '';

    try {
      this.form = await firstValueFrom(this.api.updateConfig(this.form));
      this.message = 'Configuracoes salvas com sucesso.';
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  applyIssuerMask(): void {
    this.form.issuerDocument = formatByDocumentType(this.form.issuerDocument, this.form.issuerDocumentType);
  }

  async onLogoSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const dataUrl = await this.readFileAsDataUrl(file);
    this.form.logoPath = dataUrl;
  }

  clearLogo(): void {
    this.form.logoPath = '';
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Falha ao ler imagem de logo.'));
      reader.readAsDataURL(file);
    });
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar as configuracoes.';
  }
}
