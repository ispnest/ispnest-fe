import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Try to load user (session might still be valid)
  return auth.loadCurrentUser().pipe(
    map((user) => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    }),
  );
};

export const portalAuthGuard: CanActivateFn = () => {
  const router = inject(Router);
  const hasSession = !!sessionStorage.getItem('portalCustomerId');
  if (!hasSession) {
    router.navigate(['/portal']);
    return false;
  }
  return true;
};
