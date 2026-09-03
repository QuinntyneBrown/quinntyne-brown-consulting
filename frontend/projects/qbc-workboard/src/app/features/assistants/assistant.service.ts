import { Injectable, inject, signal } from '@angular/core';
import { ASSISTANT_API, Assistant, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IAssistantService } from './assistant.service.contract';

@Injectable({ providedIn: 'root' })
export class AssistantService implements IAssistantService {
  private readonly api = inject(ASSISTANT_API);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly assistantsValue = signal<readonly Assistant[]>([]);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly assistants = this.assistantsValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.assistantsValue.set(await this.api.getAll());
      this.loadingValue.set('loaded');
    } catch (error) { this.fail(error); }
  }

  async save(id: string | null, fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<boolean> {
    return this.mutate(id
      ? this.api.update(id, fullName, role, specialties, availability)
      : this.api.create(fullName, role, specialties, availability), 'Assistant saved.');
  }

  async delete(id: string): Promise<boolean> {
    return this.mutate(this.api.delete(id), 'Assistant deleted.');
  }

  private async mutate(request: Promise<unknown>, message: string): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await request;
      await this.load();
      this.feedback.show(message);
      return true;
    } catch (error) { this.fail(error); return false; }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
