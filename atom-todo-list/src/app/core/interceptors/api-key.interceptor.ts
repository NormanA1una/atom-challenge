import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../shared/environments/environment';

export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    headers: req.headers.set('X-API-Key', environment.apiKey),
  });
  return next(cloned);
};
