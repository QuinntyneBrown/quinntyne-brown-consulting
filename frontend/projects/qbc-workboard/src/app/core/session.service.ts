import { Injectable, computed, inject, signal } from '@angular/core';
import { ACCESS_SERVICE, ACCESS_TOKEN_STORE, presentApiError } from '@qbc/api';
import { ISessionService } from './session.service.contract';

@Injectable({ providedIn: 'root' })
export class SessionService implements ISessionService {
  private readonly access = inject(ACCESS_SERVICE);
  private readonly store = inject(ACCESS_TOKEN_STORE);
  private readonly errorValue = signal<string | null>(null);
  private readonly pendingValue = signal(false);

  readonly isUnlocked = computed(() => this.store.token() !== null);
  readonly error = this.errorValue.asReadonly();
  readonly pending = this.pendingValue.asReadonly();

  async unlock(passcode: string): Promise<boolean> {
    this.pendingValue.set(true);
    this.errorValue.set(null);
    try {
      this.store.save(await this.access.unlock(passcode));
      return true;
    } catch (error) {
      this.errorValue.set(presentApiError(error));
      return false;
    } finally {
      this.pendingValue.set(false);
    }
  }

  lock(): void {
    this.store.clear();
    this.errorValue.set(null);
  }
}
