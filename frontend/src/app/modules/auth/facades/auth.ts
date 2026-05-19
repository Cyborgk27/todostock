import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router'; 
import { AutenticacinService, AuthLogin200Response } from '../../../core/api';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private authApiService = inject(AutenticacinService);
  private router = inject(Router);

  // ESTADO PRIVADO (Signals)
  private _user = signal<any | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // EXPOSICIÓN PÚBLICA (Read-only)
  public user = computed(() => this._user());
  public isLoading = computed(() => this._isLoading());
  public errorMessage = computed(() => this._error());
  public isAuthenticated = computed(() => !!this._user() || !!localStorage.getItem('token'));

  login(credentials: { email: string; password: string }) {
    this._isLoading.set(true);
    this._error.set(null);

    return this.authApiService.authLogin(credentials ).pipe(
      tap({
        next: (res: AuthLogin200Response) => {
          localStorage.setItem('token', res.access_token || '');
          this._user.set(res.user);
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
    this.authApiService.authLogout().subscribe(() => {
      localStorage.removeItem('token');
      this._user.set(null);
      this.router.navigate(['/auth/login']);
    });
  }
}
