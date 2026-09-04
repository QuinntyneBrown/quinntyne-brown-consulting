import { Injectable, inject, signal } from '@angular/core';
import { Epic, HIERARCHY_SERVICE, presentApiError } from '@qbc/api';
import { FEEDBACK_SERVICE } from '../../core/feedback.service.contract';
import { LoadingState } from '../../models/loading-state';
import { IEpicSummaryService } from './epic-summary.service.contract';

/**
 * Reads and writes one epic: its parent, its name, and its summary. The summary is the epic's own
 * markdown document, so a save is an ordinary epic create or update and every projection that names
 * the epic sees it.
 */
@Injectable({ providedIn: 'root' })
export class EpicSummaryService implements IEpicSummaryService {
  private readonly backendService = inject(HIERARCHY_SERVICE);
  private readonly feedback = inject(FEEDBACK_SERVICE);
  private readonly epicValue = signal<Epic | null>(null);
  private readonly loadingValue = signal<LoadingState>('idle');
  private readonly errorValue = signal<string | null>(null);
  readonly epic = this.epicValue.asReadonly();
  readonly loadingState = this.loadingValue.asReadonly();
  readonly error = this.errorValue.asReadonly();

  async load(id: string): Promise<void> {
    this.loadingValue.set('loading');
    this.errorValue.set(null);
    try {
      this.epicValue.set(await this.backendService.getEpic(id));
      this.loadingValue.set('loaded');
    } catch (error) {
      this.fail(error);
    }
  }

  async create(initiativeId: string, name: string, summary: string): Promise<Epic | null> {
    return this.store(this.backendService.createEpic(initiativeId, name, summary), 'Epic created.');
  }

  async save(
    id: string,
    initiativeId: string,
    name: string,
    summary: string,
  ): Promise<Epic | null> {
    return this.store(
      this.backendService.updateEpic(id, initiativeId, name, summary),
      'Epic saved.',
    );
  }

  private async store(request: Promise<Epic>, message: string): Promise<Epic | null> {
    this.errorValue.set(null);
    try {
      const stored = await request;
      this.epicValue.set(stored);
      this.loadingValue.set('loaded');
      this.feedback.show(message);
      return stored;
    } catch (error) {
      this.fail(error);
      return null;
    }
  }

  private fail(error: unknown): void {
    const message = presentApiError(error);
    this.errorValue.set(message);
    this.loadingValue.set('failed');
    this.feedback.show(message, 'error');
  }
}
