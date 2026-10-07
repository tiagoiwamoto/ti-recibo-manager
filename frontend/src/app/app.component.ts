import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NbButtonModule,
  NbIconModule,
  NbLayoutModule,
  NbMenuItem,
  NbMenuModule,
  NbSidebarModule,
  NbSidebarService
} from '@nebular/theme';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, RouterOutlet, NbLayoutModule, NbSidebarModule, NbMenuModule, NbButtonModule, NbIconModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly isLoggedIn$ = this.authService.isLoggedIn$;

  readonly menuItems: NbMenuItem[] = [
    { title: 'Dashboard', icon: 'home-outline', link: '/', home: true },
    { title: 'Clientes', icon: 'people-outline', link: '/clientes' },
    { title: 'Recibos', icon: 'file-text-outline', link: '/recibos' },
    { title: 'Configuracoes', icon: 'settings-2-outline', link: '/configuracoes' }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly sidebarService: NbSidebarService
  ) {
    void this.authService.initializeAuth();
  }

  toggleSidebar(): void {
    this.sidebarService.toggle(false, 'menu-sidebar');
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
