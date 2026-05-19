import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Ui } from '../service/ui';
import { Auth } from '../../modules/auth/facades/auth';
import { Router } from '@angular/router';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const ui = inject(Ui);
  const authFacade = inject(Auth);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocurrió un error inesperado en el sistema.';

      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Solicitud incorrecta.';
          ui.showError(errorMessage, 'Datos Inválidos');
          break;

        case 401:
          errorMessage = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
          ui.showToast(errorMessage, 'warning');
          
          localStorage.removeItem('token');
          router.navigate(['/auth/login']);
          break;

        case 403:
          errorMessage = 'No tienes permisos suficientes para realizar esta acción.';
          ui.showError(errorMessage, 'Acceso Denegado');
          break;

        case 422:
          if (error.error?.errors) {
            const validationErrors = Object.values(error.error.errors).flat().join('\n');
            errorMessage = validationErrors || 'Error de validación en los datos.';
          } else {
            errorMessage = error.error?.message || 'Datos de formulario inválidos.';
          }
          ui.showError(errorMessage, 'Error de Validación');
          break;

        case 500:
          errorMessage = 'El servidor experimentó un problema interno. Inténtalo más tarde.';
          ui.showError(errorMessage, 'Error Interno 500');
          break;

        case 0:
          errorMessage = 'No se pudo establecer conexión con el servidor de TodoStock.';
          ui.showError(errorMessage, 'Error de Conexión');
          break;

        default:
          errorMessage = error.error?.message || `Error código: ${error.status}`;
          ui.showToast(errorMessage, 'error');
          break;
      }

      return throwError(() => error);
    })
  );
};