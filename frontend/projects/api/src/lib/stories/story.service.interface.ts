import { StoryDraft } from '../models/story-draft';
import { Story } from '../models/story';

export interface IStoryService {
  getBacklog(): Promise<readonly Story[]>;
  get(id: string): Promise<Story>;
  create(draft: StoryDraft): Promise<Story>;
  update(id: string, draft: StoryDraft): Promise<Story>;
  groom(id: string): Promise<Story>;
  markUnready(id: string): Promise<Story>;
  archive(id: string): Promise<Story>;
  restore(id: string): Promise<Story>;
  move(id: string, status: Story['boardStatus']): Promise<Story>;
  delete(id: string): Promise<void>;
}
