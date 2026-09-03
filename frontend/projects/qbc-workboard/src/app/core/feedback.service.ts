import { Injectable, signal } from '@angular/core';
import { IFeedbackService } from './feedback.service.contract';

@Injectable({ providedIn: 'root' })
export class FeedbackService implements IFeedbackService {
  private readonly value = signal<import('../models/feedback-message').FeedbackMessage | null>(null);
  readonly message = this.value.asReadonly();
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(text: string, kind: 'success' | 'error' = 'success'): void {
    this.value.set({ text, kind });
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.clear(), 4500);
  }

  clear(): void {
    this.value.set(null);
  }
}

