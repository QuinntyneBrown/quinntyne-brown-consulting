import { Injectable, inject, signal } from '@angular/core';
import { HIERARCHY_SERVICE, Initiative, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IInitiativeBriefService } from './initiative-brief.service.contract';

/**
 * Reads and writes one initiative's outcome brief. The brief is the initiative's description, so a
 * save is an ordinary initiative update and every projection that names the initiative sees it.
 */
@Injectable({ providedIn: 'root' })
export class InitiativeBriefService implements IInitiativeBriefService {
  private readonly backendService = inject(HIERARCHY_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly initiativeValue = signal<Initiative | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly initiative = this.initiativeValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(id: string): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.initiativeValue.set(await this.backendService.getInitiative(id));
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async save(id: string, name: string, description: string): Promise<boolean> {
    this.errorValue.set(null);
    try {
      this.initiativeValue.set(await this.backendService.updateInitiative(id, name, description));
      this.feedback.show('Initiative brief saved.');
      return true;
    } catch (error) {
      this.fail(error);
      return false;
    }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
