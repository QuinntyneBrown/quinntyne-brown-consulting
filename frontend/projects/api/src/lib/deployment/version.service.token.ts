import { InjectionToken } from '@angular/core';
import { IVersionService } from './version.service.interface';

export const VERSION_SERVICE = new InjectionToken<IVersionService>('VERSION_SERVICE');
