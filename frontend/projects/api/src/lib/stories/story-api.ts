import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { StoryDraft } from '../models/story-draft';
import { Story } from '../models/story';
import { IStoryApi } from './story-api.interface';

@Injectable()
export class StoryApi implements IStoryApi {
  private readonly http = inject(HttpClient);

  getBacklog(): Promise<readonly Story[]> {
    return firstValueFrom(this.http.get<readonly Story[]>('/api/stories/backlog'));
  }

  get(id: string): Promise<Story> {
    return firstValueFrom(this.http.get<Story>(`/api/stories/${id}`));
  }

  create(draft: StoryDraft): Promise<Story> {
    return firstValueFrom(this.http.post<Story>('/api/stories', draft));
  }

  update(id: string, draft: StoryDraft): Promise<Story> {
    return firstValueFrom(this.http.put<Story>(`/api/stories/${id}`, draft));
  }

  groom(id: string): Promise<Story> {
    return this.postAction(id, 'groom');
  }

  markUnready(id: string): Promise<Story> {
    return this.postAction(id, 'mark-unready');
  }

  archive(id: string): Promise<Story> {
    return this.postAction(id, 'archive');
  }

  restore(id: string): Promise<Story> {
    return this.postAction(id, 'restore');
  }

  move(id: string, status: Story['boardStatus']): Promise<Story> {
    return firstValueFrom(this.http.post<Story>(`/api/stories/${id}/move`, { status }));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/api/stories/${id}`));
  }

  private postAction(id: string, action: string): Promise<Story> {
    return firstValueFrom(this.http.post<Story>(`/api/stories/${id}/${action}`, {}));
  }
}
