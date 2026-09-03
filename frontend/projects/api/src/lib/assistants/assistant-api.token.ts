import { InjectionToken } from '@angular/core';
import { IAssistantApi } from './assistant-api.interface';

export const ASSISTANT_API = new InjectionToken<IAssistantApi>('ASSISTANT_API');
