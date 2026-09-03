import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ACCESS_TOKEN_STORE } from './access-token-store.token';
import { UNLOCK_URL } from './unlock-url';

/**
 * Presents the workspace session token on every API call except the unlock request itself,
 * and drops a token the server has rejected so the application returns to the passcode page.
 */
export const accessTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(ACCESS_TOKEN_STORE);
  const session = store.token();
  const authorized =
    session && request.url !== UNLOCK_URL
      ? request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        request.url !== UNLOCK_URL
      ) {
        store.clear();
      }
      return throwError(() => error);
    }),
  );
};
