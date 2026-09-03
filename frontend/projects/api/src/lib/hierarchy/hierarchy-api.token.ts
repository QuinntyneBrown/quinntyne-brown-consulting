import { InjectionToken } from '@angular/core';
import { IHierarchyApi } from './hierarchy-api.interface';

export const HIERARCHY_API = new InjectionToken<IHierarchyApi>('HIERARCHY_API');
