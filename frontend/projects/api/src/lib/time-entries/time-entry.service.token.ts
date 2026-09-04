import { InjectionToken } from '@angular/core';
import { ITimeEntryService } from './time-entry.service.interface';

export const TIME_ENTRY_SERVICE = new InjectionToken<ITimeEntryService>('TIME_ENTRY_SERVICE');
