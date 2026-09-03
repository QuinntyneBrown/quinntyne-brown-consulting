import { ActiveSprintBoard } from '../models/active-sprint-board';
import { Sprint } from '../models/sprint';

export interface ISprintApi {
  getAll(): Promise<readonly Sprint[]>;
  get(id: string): Promise<Sprint>;
  getActiveBoard(): Promise<ActiveSprintBoard | null>;
  create(name: string, goal: string, startDate: string): Promise<Sprint>;
  update(id: string, name: string, goal: string, startDate: string): Promise<Sprint>;
  start(id: string): Promise<Sprint>;
  complete(id: string): Promise<Sprint>;
  assignStory(sprintId: string, storyId: string): Promise<void>;
  removeStory(sprintId: string, storyId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
