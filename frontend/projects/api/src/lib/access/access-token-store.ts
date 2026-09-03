import { Injectable, signal } from '@angular/core';
import { AccessToken } from '../models/access-token';
import { IAccessTokenStore } from './access-token-store.interface';

const STORAGE_KEY = 'qbc.workboard.access-token';

/**
 * Holds the workspace session token. This is the only value the application keeps in
 * browser storage: product records stay server-authoritative and are never cached here.
 * Every access is guarded because storage throws in private modes and embedded contexts.
 */
@Injectable()
export class AccessTokenStore implements IAccessTokenStore {
  private readonly current = signal<AccessToken | null>(read());
  readonly token = this.current.asReadonly();

  save(token: AccessToken): void {
    this.current.set(token);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(token));
    } catch {
      // A session that cannot be persisted still works until the tab closes.
    }
  }

  clear(): void {
    this.current.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing to do: the in-memory signal is already cleared.
    }
  }
}

function read(): AccessToken | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AccessToken>;
    if (typeof parsed.token !== 'string' || typeof parsed.expiresAtUtc !== 'string') {
      return null;
    }
    return Date.parse(parsed.expiresAtUtc) > Date.now()
      ? { token: parsed.token, expiresAtUtc: parsed.expiresAtUtc }
      : null;
  } catch {
    return null;
  }
}
