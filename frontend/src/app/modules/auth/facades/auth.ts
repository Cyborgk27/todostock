import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacinService, AuthLogin200Response, AuthLogin200ResponseUser } from '../../../core/api';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private authApiService = inject(AutenticacinService);
  private router = inject(Router);

  // ESTADO PRIVADO 
  private _user = signal<AuthLogin200ResponseUser | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // EXPOSICIÓN PÚBLICA 
  public user = computed(() => this._user());
  public isLoading = computed(() => this._isLoading());
  public errorMessage = computed(() => this._error());
  public isAuthenticated = computed(() => !!this._user() || !!localStorage.getItem('token'));

  public userName = computed(() => this._user()?.name || '');
  public userEmail = computed(() => this._user()?.email || '');

  login(credentials: { email: string; password: string }) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.authApiService.authLogin(credentials).pipe(
      tap({
        next: (res: AuthLogin200Response) => {
          localStorage.setItem('token', res.access_token || '');
          this._user.set(res.user || null);
          this._isLoading.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this._error.set(err.error?.message || 'Error de autenticación');
          this._isLoading.set(false);
        }
      })
    );
  }

  logout() {
    return this.authApiService.authLogout().pipe(
      tap({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      })
    )
  }

  private clearSession() {
    localStorage.removeItem('token');
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Devuelve el token de acceso actual para el interceptor HTTP
   */
  public getToken(): string | null {
    return localStorage.getItem('token');
  }
}