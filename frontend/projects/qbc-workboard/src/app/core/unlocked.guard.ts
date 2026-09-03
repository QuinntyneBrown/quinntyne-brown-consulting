import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SESSION_SERVICE } from './session.service.contract';

export const unlockedGuard: CanActivateFn = () =>
  inject(SESSION_SERVICE).isUnlocked() || inject(Router).createUrlTree(['/unlock']);
