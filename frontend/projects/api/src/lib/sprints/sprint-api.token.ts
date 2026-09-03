import { InjectionToken } from '@angular/core';
import { ISprintApi } from './sprint-api.interface';

export const SPRINT_API = new InjectionToken<ISprintApi>('SPRINT_API');
