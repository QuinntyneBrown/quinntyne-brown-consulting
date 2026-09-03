import { InjectionToken } from '@angular/core';
import { IStoryApi } from './story-api.interface';

export const STORY_API = new InjectionToken<IStoryApi>('STORY_API');
