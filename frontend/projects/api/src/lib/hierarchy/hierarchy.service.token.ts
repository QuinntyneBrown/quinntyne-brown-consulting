import { InjectionToken } from '@angular/core';
import { IHierarchyService } from './hierarchy.service.interface';

export const HIERARCHY_SERVICE = new InjectionToken<IHierarchyService>('HIERARCHY_SERVICE');
