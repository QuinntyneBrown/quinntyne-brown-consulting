import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessToken } from '../models/access-token';
import { IAccessService } from './access.service.interface';
import { UNLOCK_URL } from './unlock-url';

@Injectable()
export class AccessService implements IAccessService {
  private readonly http = inject(HttpClient);

  unlock(passcode: string): Promise<AccessToken> {
    return firstValueFrom(this.http.post<AccessToken>(UNLOCK_URL, { passcode }));
  }
}
