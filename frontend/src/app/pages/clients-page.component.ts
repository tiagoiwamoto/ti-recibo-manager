import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { Client, ClientForm } from '../core/models';
import { formatByDocumentType } from '../core/document-mask';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-page.component.html'
})
export class ClientsPageComponent implements OnInit {
  clients: Client[] = [];
  search = '';
  loading = false;
  error = '';
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

  reset(): void {
    this.clientForm = this.emptyForm();
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
    this.applyDocumentMask();
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

      this.reset();
      await this.load();
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
      if (this.clientForm.id === id) {
        this.reset();
      }
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

  applyDocumentMask(): void {
    this.clientForm.document = formatByDocumentType(this.clientForm.document, this.clientForm.documentType);
  }

  onDocumentTypeChange(): void {
    this.applyDocumentMask();
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar o cadastro de clientes.';
  }
}
