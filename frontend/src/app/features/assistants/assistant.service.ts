import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { presentApiError } from '../../core/api-error.presenter';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { Assistant } from '../../models/assistant';
import { LoadingState } from '../../models/loading-state';
import { IAssistantService } from './assistant.service.contract';

@Injectable({ providedIn: 'root' })
export class AssistantService implements IAssistantService {
  private readonly http = inject(HttpClient);
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
      this.assistantsValue.set(await firstValueFrom(this.http.get<readonly Assistant[]>('/api/assistants')));
      this.loadingValue.set('loaded');
    } catch (error) { this.fail(error); }
  }

  async save(id: string | null, fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<boolean> {
    const body = { fullName, role, specialties, availability };
    return this.mutate(id ? this.http.put(`/api/assistants/${id}`, body) : this.http.post('/api/assistants', body), 'Assistant saved.');
  }

  async delete(id: string): Promise<boolean> {
    return this.mutate(this.http.delete(`/api/assistants/${id}`), 'Assistant deleted.');
  }

  private async mutate(request: import('rxjs').Observable<unknown>, message: string): Promise<boolean> {
    this.errorValue.set(null);
    try {
      await firstValueFrom(request);
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

