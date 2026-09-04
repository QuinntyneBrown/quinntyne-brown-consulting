import { Assistant } from '../models/assistant';
import { AssistantHours } from '../models/assistant-hours';

export interface IAssistantService {
  getAll(): Promise<readonly Assistant[]>;
  get(id: string): Promise<Assistant>;
  getHours(id: string): Promise<AssistantHours>;
  create(
    fullName: string,
    role: string,
    specialties: readonly string[],
    availability: Assistant['availability'],
  ): Promise<Assistant>;
  update(
    id: string,
    fullName: string,
    role: string,
    specialties: readonly string[],
    availability: Assistant['availability'],
  ): Promise<Assistant>;
  delete(id: string): Promise<void>;
}
