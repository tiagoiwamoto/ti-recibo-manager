import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent implements OnInit {
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    await this.authService.initializeAuth();
    if (this.authService.getToken()) {
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
      await this.router.navigateByUrl(returnUrl);
    }
  }

  async loginWithKeycloak(): Promise<void> {
    this.loading = true;
    try {
      await this.authService.login();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      this.loading = false;
    }
  }
}
