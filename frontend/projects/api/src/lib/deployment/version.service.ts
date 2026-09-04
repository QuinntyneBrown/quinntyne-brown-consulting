import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DeploymentVersion } from '../models/deployment-version';
import { IVersionService } from './version.service.interface';

@Injectable()
export class VersionService implements IVersionService {
  private readonly http = inject(HttpClient);

  get(): Promise<DeploymentVersion> {
    return firstValueFrom(this.http.get<DeploymentVersion>('/api/version'));
  }
}
