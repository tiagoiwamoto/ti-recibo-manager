import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../core/api.service';
import { DashboardSummary } from '../core/models';
import { StatCardComponent } from '../shared/stat-card.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, StatCardComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = false;
  error = '';

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    void this.load();
  }

  async load(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      this.summary = await firstValueFrom(this.api.getDashboard());
    } catch (error) {
      this.error = this.describeError(error);
    } finally {
      this.loading = false;
    }
  }

  trackById(_: number, receipt: { id: string }): string {
    return receipt.id;
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : 'Falha ao carregar o dashboard.';
  }
}
