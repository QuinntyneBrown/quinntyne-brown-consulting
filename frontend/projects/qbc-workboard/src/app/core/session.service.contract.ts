import { InjectionToken, Signal } from '@angular/core';

export interface ISessionService {
  readonly isUnlocked: Signal<boolean>;
  readonly error: Signal<string | null>;
  readonly pending: Signal<boolean>;
  unlock(passcode: string): Promise<boolean>;
  lock(): void;
}

export const SESSION_SERVICE = new InjectionToken<ISessionService>('SESSION_SERVICE');
