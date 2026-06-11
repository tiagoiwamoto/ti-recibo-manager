import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppNavbarComponent } from './shared/app-navbar.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AppNavbarComponent, AsyncPipe],
  templateUrl: './app.component.html'
})
export class AppComponent {
  readonly isLoggedIn$ = this.authService.isLoggedIn$;

  constructor(private readonly authService: AuthService) {
    void this.authService.initializeAuth();
  }

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
