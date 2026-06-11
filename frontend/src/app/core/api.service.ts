import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppConfig, Client, ClientForm, DashboardSummary, Receipt, ReceiptForm, ReceiptPreviewResponse } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(this.url('/dashboard'));
  }

  listClients(query = ''): Observable<Client[]> {
    const params = this.queryParams(query);
    return params ? this.http.get<Client[]>(this.url('/clients'), { params }) : this.http.get<Client[]>(this.url('/clients'));
  }

  createClient(payload: ClientForm): Observable<Client> {
    return this.http.post<Client>(this.url('/clients'), payload);
  }

  updateClient(id: string, payload: ClientForm): Observable<Client> {
    return this.http.put<Client>(this.url(`/clients/${id}`), payload);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/clients/${id}`));
  }

  listReceipts(query = ''): Observable<Receipt[]> {
    const params = this.queryParams(query);
    return params ? this.http.get<Receipt[]>(this.url('/receipts'), { params }) : this.http.get<Receipt[]>(this.url('/receipts'));
  }

  createReceipt(payload: ReceiptForm): Observable<Receipt> {
    return this.http.post<Receipt>(this.url('/receipts'), payload);
  }

  updateReceipt(id: string, payload: ReceiptForm): Observable<Receipt> {
    return this.http.put<Receipt>(this.url(`/receipts/${id}`), payload);
  }

  deleteReceipt(id: string): Observable<void> {
    return this.http.delete<void>(this.url(`/receipts/${id}`));
  }

  previewReceipt(id: string, template?: string): Observable<ReceiptPreviewResponse> {
    const params = template ? new HttpParams().set('template', template) : undefined;
    return this.http.get<ReceiptPreviewResponse>(this.url(`/receipts/${id}/preview`), { params });
  }

  previewReceiptDraft(payload: ReceiptForm, template?: string): Observable<ReceiptPreviewResponse> {
    const params = template ? new HttpParams().set('template', template) : undefined;
    return this.http.post<ReceiptPreviewResponse>(this.url('/receipts/preview'), payload, { params });
  }

  getConfig(): Observable<AppConfig> {
    return this.http.get<AppConfig>(this.url('/config'));
  }

  updateConfig(payload: AppConfig): Observable<AppConfig> {
    return this.http.put<AppConfig>(this.url('/config'), payload);
  }

  private url(path: string): string {
    return `${environment.apiBaseUrl}${path}`;
  }

  private queryParams(query: string): HttpParams | undefined {
    const trimmed = query.trim();
    return trimmed ? new HttpParams().set('q', trimmed) : undefined;
  }
}


