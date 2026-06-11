import { Routes } from '@angular/router';
import { ClientsPageComponent } from './pages/clients-page.component';
import { DashboardPageComponent } from './pages/dashboard-page.component';
import { ReceiptsPageComponent } from './pages/receipts-page.component';
import { SettingsPageComponent } from './pages/settings-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', pathMatch: 'full', component: DashboardPageComponent, canActivate: [authGuard] },
  { path: 'clientes', component: ClientsPageComponent, canActivate: [authGuard] },
  { path: 'recibos', component: ReceiptsPageComponent, canActivate: [authGuard] },
  { path: 'configuracoes', component: SettingsPageComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
