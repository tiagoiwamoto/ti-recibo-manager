import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

export interface AuthUser {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak: Keycloak | null = null;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly loggedIn = new BehaviorSubject<boolean>(this.hasSession());
  private readonly currentUser = new BehaviorSubject<AuthUser | null>(null);

  readonly isLoggedIn$ = this.loggedIn.asObservable();
  readonly currentUser$ = this.currentUser.asObservable();

  async initializeAuth(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      this.keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });

      try {
        const authenticated = await this.keycloak.init({
          onLoad: undefined,
          pkceMethod: 'S256',
          checkLoginIframe: false,
          redirectUri: window.location.href,
          responseMode: 'query',
          token: localStorage.getItem('token') || undefined,
          refreshToken: localStorage.getItem('refreshToken') || undefined
        });

        this.initialized = true;

        if (authenticated && this.keycloak.token) {
          this.storeTokens();
          this.syncCurrentUser();
          this.loggedIn.next(true);
          this.startTokenRefresh();
          return;
        }

        this.loggedIn.next(!!localStorage.getItem('token'));
      } catch (error) {
        console.error('AuthService: Keycloak initialization failed', error);
        this.initialized = true;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async login(): Promise<void> {
    if (!this.keycloak) {
      await this.initializeAuth();
    }
    await this.keycloak?.login({ redirectUri: window.location.origin + '/' });
  }

  async logout(): Promise<void> {
    this.stopTokenRefresh();
    try {
      await this.keycloak?.logout({ redirectUri: window.location.origin + '/login' });
    } catch (error) {
      console.error('AuthService: logout error', error);
    }
    this.clearSession();
  }

  getToken(): string | null {
    return this.keycloak?.token ?? localStorage.getItem('token');
  }

  async refreshToken(): Promise<boolean> {
    if (!this.keycloak) {
      return false;
    }
    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        this.storeTokens();
      }
      return true;
    } catch (error) {
      console.error('AuthService: token refresh failed', error);
      this.clearSession();
      return false;
    }
  }

  getUserProfile(): AuthUser | null {
    return this.currentUser.value;
  }

  hasRole(role: string): boolean {
    return this.currentUser.value?.roles.includes(role) ?? false;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  private storeTokens(): void {
    if (this.keycloak?.token) {
      localStorage.setItem('token', this.keycloak.token);
    }
    if (this.keycloak?.refreshToken) {
      localStorage.setItem('refreshToken', this.keycloak.refreshToken);
    }
  }

  private syncCurrentUser(): void {
    const token = this.keycloak?.tokenParsed as Record<string, unknown> | undefined;
    if (!token) {
      this.currentUser.next(null);
      return;
    }
    this.currentUser.next({
      id: token['sub'] as string,
      username: token['preferred_username'] as string,
      email: token['email'] as string,
      firstName: token['given_name'] as string,
      lastName: token['family_name'] as string,
      roles: this.extractRoles(token)
    });
  }

  private extractRoles(token: Record<string, unknown>): string[] {
    const resourceAccess = (token['resource_access'] as Record<string, { roles?: string[] }>) || {};
    const realmAccess = (token['realm_access'] as { roles?: string[] }) || {};
    const clientRoles = resourceAccess[environment.keycloak.clientId]?.roles || [];
    const realmRoles = realmAccess.roles || [];
    return [...clientRoles, ...realmRoles];
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh();
    const exp = this.keycloak?.tokenParsed?.exp;
    if (!exp) {
      return;
    }
    const timeUntilExpiry = exp * 1000 - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 30000, 5000);
    this.refreshTimer = setTimeout(async () => {
      if (await this.refreshToken()) {
        this.startTokenRefresh();
      }
    }, refreshTime);
  }

  private stopTokenRefresh(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private clearSession(): void {
    this.stopTokenRefresh();
    this.loggedIn.next(false);
    this.currentUser.next(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }

  private hasSession(): boolean {
    return localStorage.getItem('token') !== null;
  }
}
