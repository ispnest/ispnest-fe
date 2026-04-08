import { HttpInterceptorFn } from '@angular/common/http';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const modified = req.clone({
    withCredentials: true,
    setHeaders: { 'X-API-Version': '1.0' },
  });
  return next(modified);
};
