import { Assistant } from '../models/assistant';

export interface IAssistantApi {
  getAll(): Promise<readonly Assistant[]>;
  get(id: string): Promise<Assistant>;
  create(fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<Assistant>;
  update(id: string, fullName: string, role: string, specialties: readonly string[], availability: Assistant['availability']): Promise<Assistant>;
  delete(id: string): Promise<void>;
}
