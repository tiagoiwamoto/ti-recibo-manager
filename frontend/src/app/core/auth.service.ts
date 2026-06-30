import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, UserManager, UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
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
  private userManager: UserManager;
  private initialized = false;
  private initializationPromise: Promise<void> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly loggedIn = new BehaviorSubject<boolean>(this.hasSession());
  private readonly currentUser = new BehaviorSubject<AuthUser | null>(null);

  readonly isLoggedIn$ = this.loggedIn.asObservable();
  readonly currentUser$ = this.currentUser.asObservable();

  constructor() {
    const settings: UserManagerSettings = {
      authority: environment.oidc.authority,
      client_id: environment.oidc.clientId,
      redirect_uri: environment.oidc.redirectUri,
      post_logout_redirect_uri: environment.oidc.postLogoutRedirectUri,
      response_type: 'code',
      scope: environment.oidc.scopes,
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
      includeIdTokenInSilentRenew: true,
      monitorSession: true
    };
    this.userManager = new UserManager(settings);

    this.userManager.events.addUserLoaded((user) => {
      this.persistUser(user);
      this.syncCurrentUser();
      this.startTokenRefresh();
    });

    this.userManager.events.addUserUnloaded(() => {
      this.clearSession();
    });

    this.userManager.events.addAccessTokenExpired(() => {
      this.refreshToken();
    });
  }

  async initializeAuth(): Promise<void> {
    if (this.initialized) {
      return;
    }
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('code') && url.searchParams.has('state')) {
          const user = await this.userManager.signinRedirectCallback();
          this.persistUser(user);
          window.history.replaceState({}, document.title, '/');
          this.initialized = true;
          this.syncCurrentUser();
          this.loggedIn.next(true);
          this.startTokenRefresh();
          return;
        }

        const user = await this.userManager.getUser();

        if (user && user.access_token && !user.expired) {
          this.persistUser(user);
          this.syncCurrentUser();
          this.loggedIn.next(true);
          this.startTokenRefresh();
        } else {
          const localToken = localStorage.getItem('token');
          this.loggedIn.next(!!localToken);
        }

        this.initialized = true;
      } catch (error) {
        console.error('AuthService: OIDC initialization failed', error);
        this.initialized = true;
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }

  async login(): Promise<void> {
    await this.userManager.signinRedirect();
  }

  async logout(): Promise<void> {
    this.stopTokenRefresh();
    const user = await this.userManager.getUser();
    if (user) {
      try {
        await this.userManager.signoutRedirect();
        return;
      } catch (error) {
        console.error('AuthService: logout error', error);
      }
    }
    this.clearSession();
    window.location.href = '/login';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async refreshToken(): Promise<boolean> {
    try {
      const user = await this.userManager.signinSilent();
      if (user) {
        this.persistUser(user);
        this.syncCurrentUser();
        return true;
      }
      this.clearSession();
      return false;
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

  private persistUser(user: User | null): void {
    if (!user?.access_token) {
      return;
    }
    localStorage.setItem('token', user.access_token);
    if (user.refresh_token) {
      localStorage.setItem('refreshToken', user.refresh_token);
    }
  }

  private syncCurrentUser(): void {
    const token = this.getToken();
    if (!token) {
      this.currentUser.next(null);
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.next({
        id: payload['sub'],
        username: payload['preferred_username'],
        email: payload['email'],
        firstName: payload['given_name'],
        lastName: payload['family_name'],
        roles: this.extractRoles(payload)
      });
    } catch (error) {
      this.currentUser.next(null);
    }
  }

  private extractRoles(token: Record<string, unknown>): string[] {
    const groups = (token['groups'] as string[]) || [];
    const roles = (token['roles'] as string[]) || [];
    return [...groups, ...roles];
  }

  private startTokenRefresh(): void {
    this.stopTokenRefresh();
    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload.exp) {
        return;
      }
      const timeUntilExpiry = payload.exp * 1000 - Date.now();
      const refreshTime = Math.max(timeUntilExpiry - 30000, 5000);
      this.refreshTimer = setTimeout(async () => {
        if (await this.refreshToken()) {
          this.startTokenRefresh();
        }
      }, refreshTime);
    } catch (error) {
      console.error('AuthService: Failed to parse token for refresh scheduling', error);
    }
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
