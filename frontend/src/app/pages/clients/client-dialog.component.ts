import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  NbAlertModule,
  NbButtonModule,
  NbCardModule,
  NbDialogRef,
  NbIconModule,
  NbInputModule,
  NbSelectModule
} from '@nebular/theme';
import { ApiService } from '../../core/api.service';
import { Client, ClientForm } from '../../core/models';
import { formatByDocumentType } from '../../core/document-mask';
import { DocumentMaskDirective } from '../../core/document-mask.directive';

@Component({
  selector: 'app-client-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentMaskDirective, NbAlertModule, NbButtonModule, NbCardModule, NbIconModule, NbInputModule, NbSelectModule],
  templateUrl: './client-dialog.component.html'
})
export class ClientDialogComponent implements OnInit {
  @Input() client?: Client;

  form: ClientForm = this.emptyForm();
  loading = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly dialogRef: NbDialogRef<ClientDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.client) {
      const client = this.client;
      this.form = {
        id: client.id,
        name: client.name ?? '',
        document: client.document ?? '',
        documentType: client.documentType ?? 'CPF',
        rg: client.rg ?? '',
        birthDate: client.birthDate ?? '',
        driverLicense: client.driverLicense ?? '',
        address: client.address ?? '',
        city: client.city ?? '',
        state: client.state ?? '',
        postalCode: client.postalCode ?? '',
        country: client.country ?? 'Brasil',
        notes: client.notes ?? ''
      };
      this.form.document = formatByDocumentType(this.form.document, this.form.documentType);
    }
  }

  emptyForm(): ClientForm {
    return {
      id: null,
      name: '',
      document: '',
      documentType: 'CPF',
      rg: '',
      birthDate: '',
      driverLicense: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Brasil',
      notes: ''
    };
  }

  async save(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      const payload = { ...this.form };
      delete (payload as Partial<ClientForm>).id;

      if (this.form.id) {
        await firstValueFrom(this.api.updateClient(this.form.id, payload as ClientForm));
      } else {
        await firstValueFrom(this.api.createClient(payload as ClientForm));
      }

      this.dialogRef.close(true);
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Falha ao processar o cadastro de clientes.';
    } finally {
      this.loading = false;
    }
  }

  async loadAddressByCep(): Promise<void> {
    const cep = this.form.postalCode?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const response = await firstValueFrom(this.api.getCep(cep));
      if (response.erro) {
        this.error = 'CEP nao encontrado.';
        return;
      }
      if (response.bairro) {
        this.form.address = response.bairro + (response.logradouro ? ', ' + response.logradouro : '');
      } else {
        this.form.address = response.logradouro;
      }
      this.form.city = response.localidade;
      this.form.state = response.uf;
      if (!this.form.country) {
        this.form.country = 'Brasil';
      }
    } catch (error) {
      this.error = error instanceof Error ? error.message : 'Falha ao processar o cadastro de clientes.';
    } finally {
      this.loading = false;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
