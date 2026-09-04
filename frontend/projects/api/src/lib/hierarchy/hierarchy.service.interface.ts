import { Epic } from '../models/epic';
import { Hierarchy } from '../models/hierarchy';
import { Initiative } from '../models/initiative';

export interface IHierarchyService {
  get(): Promise<Hierarchy>;
  getInitiative(id: string): Promise<Initiative>;
  createInitiative(name: string, description: string): Promise<Initiative>;
  updateInitiative(id: string, name: string, description: string): Promise<Initiative>;
  deleteInitiative(id: string): Promise<void>;
  createEpic(initiativeId: string, name: string, summary: string): Promise<Epic>;
  updateEpic(id: string, initiativeId: string, name: string, summary: string): Promise<Epic>;
  deleteEpic(id: string): Promise<void>;
}
