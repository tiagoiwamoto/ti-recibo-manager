import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Client, ClientForm } from '../core/models';
import { formatByDocumentType } from '../core/document-mask';
import { DocumentMaskDirective } from '../core/document-mask.directive';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule, DocumentMaskDirective],
  templateUrl: './clients-page.component.html'
})
export class ClientsPageComponent implements OnInit {
  clients: Client[] = [];
  search = '';
  loading = false;
  error = '';
  modalOpen = false;
  clientForm: ClientForm = this.emptyForm();

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    void this.load();
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

  openCreate(): void {
    this.clientForm = this.emptyForm();
    this.error = '';
    this.modalOpen = true;
  }

  editClient(client: Client): void {
    this.clientForm = {
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
    this.clientForm.document = formatByDocumentType(this.clientForm.document, this.clientForm.documentType);
    this.error = '';
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.clients = await firstValueFrom(this.api.listClients(this.search));
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
      const payload = { ...this.clientForm };
      delete (payload as Partial<ClientForm>).id;

      if (this.clientForm.id) {
        await firstValueFrom(this.api.updateClient(this.clientForm.id, payload as ClientForm));
      } else {
        await firstValueFrom(this.api.createClient(payload as ClientForm));
      }

      this.modalOpen = false;
      await this.load();
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async loadAddressByCep(): Promise<void> {
    const cep = this.clientForm.postalCode?.replace(/\D/g, '');
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
        this.clientForm.address = response.bairro + (response.logradouro ? ', ' + response.logradouro : '');
      } else {
        this.clientForm.address = response.logradouro;
      }
      this.clientForm.city = response.localidade;
      this.clientForm.state = response.uf;
      if (!this.clientForm.country) {
        this.clientForm.country = 'Brasil';
      }
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Excluir este cliente?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await firstValueFrom(this.api.deleteClient(id));
      await this.load();
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  trackById(_: number, client: Client): string {
    return client.id;
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar o cadastro de clientes.';
  }
}
