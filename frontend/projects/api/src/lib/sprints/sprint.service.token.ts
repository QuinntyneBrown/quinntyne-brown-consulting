import { InjectionToken } from '@angular/core';
import { ISprintService } from './sprint.service.interface';

export const SPRINT_SERVICE = new InjectionToken<ISprintService>('SPRINT_SERVICE');
