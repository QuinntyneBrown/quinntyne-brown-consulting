import { Signal } from '@angular/core';
import { AccessToken } from '../models/access-token';

export interface IAccessTokenStore {
  /** The stored token, or null when absent or expired. */
  readonly token: Signal<AccessToken | null>;
  save(token: AccessToken): void;
  clear(): void;
}
