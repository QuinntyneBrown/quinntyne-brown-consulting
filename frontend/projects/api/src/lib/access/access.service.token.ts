import { InjectionToken } from '@angular/core';
import { IAccessService } from './access.service.interface';

export const ACCESS_SERVICE = new InjectionToken<IAccessService>('ACCESS_SERVICE');
