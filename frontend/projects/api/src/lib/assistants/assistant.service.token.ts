import { InjectionToken } from '@angular/core';
import { IAssistantService } from './assistant.service.interface';

export const ASSISTANT_SERVICE = new InjectionToken<IAssistantService>('ASSISTANT_SERVICE');
