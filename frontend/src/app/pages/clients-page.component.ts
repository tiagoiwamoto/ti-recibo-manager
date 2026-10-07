import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { NbAlertModule, NbButtonModule, NbCardModule, NbDialogService, NbInputModule } from '@nebular/theme';
import { ApiService } from '../core/api.service';
import { Client } from '../core/models';
import { ClientDialogComponent } from './clients/client-dialog.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-clients-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NbAlertModule, NbButtonModule, NbCardModule, NbInputModule],
  templateUrl: './clients-page.component.html'
})
export class ClientsPageComponent implements OnInit {
  clients: Client[] = [];
  search = '';
  loading = false;
  error = '';

  constructor(
    private readonly api: ApiService,
    private readonly dialogService: NbDialogService
  ) {}

  ngOnInit(): void {
    void this.load();
  }

  openCreate(): void {
    this.error = '';
    this.dialogService
      .open(ClientDialogComponent)
      .onClose.subscribe((saved) => {
        if (saved) {
          void this.load();
        }
      });
  }

  editClient(client: Client): void {
    this.error = '';
    this.dialogService
      .open(ClientDialogComponent, { context: { client } })
      .onClose.subscribe((saved) => {
        if (saved) {
          void this.load();
        }
      });
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

  remove(id: string): void {
    this.dialogService
      .open(ConfirmDialogComponent, { context: { message: 'Excluir este cliente?' } })
      .onClose.subscribe(async (confirmed) => {
        if (!confirmed) {
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
      });
  }

  trackById(_: number, client: Client): string {
    return client.id;
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao processar o cadastro de clientes.';
  }
}
