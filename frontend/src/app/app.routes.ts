import { Routes } from '@angular/router';
import { ClientsPageComponent } from './pages/clients-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { ReceiptsPageComponent } from './pages/receipts-page.component';
import { SettingsPageComponent } from './pages/settings-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: DashboardPageComponent },
  { path: 'clientes', component: ClientsPageComponent },
  { path: 'recibos', component: ReceiptsPageComponent },
  { path: 'configuracoes', component: SettingsPageComponent },
  { path: '**', redirectTo: '' }
];

