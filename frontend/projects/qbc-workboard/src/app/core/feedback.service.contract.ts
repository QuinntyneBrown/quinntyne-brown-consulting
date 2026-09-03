import { InjectionToken, Signal } from '@angular/core';
import { FeedbackMessage } from '../models/feedback-message';

export interface IFeedbackService {
  readonly message: Signal<FeedbackMessage | null>;
  show(text: string, kind?: 'success' | 'error'): void;
  clear(): void;
}

export const FEEDBACK_SERVICE = new InjectionToken<IFeedbackService>('FEEDBACK_SERVICE');

