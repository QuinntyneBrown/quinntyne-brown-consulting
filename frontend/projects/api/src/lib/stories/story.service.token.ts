import { InjectionToken } from '@angular/core';
import { IStoryService } from './story.service.interface';

export const STORY_SERVICE = new InjectionToken<IStoryService>('STORY_SERVICE');
