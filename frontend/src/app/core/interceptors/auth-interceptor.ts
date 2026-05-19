import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../modules/auth/facades/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authFacade = inject(Auth);
  const token = authFacade.getToken();

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};
