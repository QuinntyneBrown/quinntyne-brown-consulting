import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Assistant } from '../models/assistant';
import { IAssistantApi } from './assistant-api.interface';

@Injectable()
export class AssistantApi implements IAssistantApi {
  private readonly http = inject(HttpClient);

  getAll(): Promise<readonly Assistant[]> {
    return firstValueFrom(this.http.get<readonly Assistant[]>('/api/assistants'));
  }

  get(id: string): Promise<Assistant> {
    return firstValueFrom(this.http.get<Assistant>(`/api/assistants/${id}`));
  }

  create(fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<Assistant> {
    return firstValueFrom(this.http.post<Assistant>('/api/assistants', { fullName, role, specialties, availability }));
  }

  update(id: string, fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<Assistant> {
    return firstValueFrom(this.http.put<Assistant>(`/api/assistants/${id}`, { fullName, role, specialties, availability }));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/assistants/${id}`));
  }
}
