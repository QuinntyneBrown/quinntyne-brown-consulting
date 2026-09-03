import { InjectionToken } from '@angular/core';
import { IAccessTokenStore } from './access-token-store.interface';

export const ACCESS_TOKEN_STORE = new InjectionToken<IAccessTokenStore>('ACCESS_TOKEN_STORE');
