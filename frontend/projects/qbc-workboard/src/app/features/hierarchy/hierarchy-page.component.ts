import { Component, OnInit, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EpicHierarchy, InitiativeHierarchy } from '@qbc/api';
import {
  ButtonComponent,
  ConfirmDialogComponent,
  EmptyStateComponent,
  EpicRowComponent,
  FormErrorComponent,
  InitiativeCardComponent,
  LoadingStateComponent,
  PageComponent,
  PageHeaderComponent,
  pluralize,
} from '@qbc/components';
import { summariseMarkdown } from '../markdown-document/markdown/summarise-markdown';
import { HIERARCHY_SERVICE } from './hierarchy.service.contract';

@Component({
  selector: 'app-hierarchy-page',
  imports: [
    ButtonComponent,
    ConfirmDialogComponent,
    EmptyStateComponent,
    EpicRowComponent,
    FormErrorComponent,
    InitiativeCardComponent,
    LoadingStateComponent,
    PageComponent,
    PageHeaderComponent,
  ],
  templateUrl: './hierarchy-page.component.html',
  styleUrl: './hierarchy-page.component.scss',
})
export class HierarchyPageComponent implements OnInit {
  private readonly confirm = viewChild.required(ConfirmDialogComponent);
  private readonly router = inject(Router);
  readonly service = inject(HIERARCHY_SERVICE);

  ngOnInit(): void {
    void this.service.load();
  }

  /**
   * A record is a name and a markdown document saved together, so both are written on the record's
   * own page rather than in a form beside the hierarchy.
   */
  newInitiative(): void {
    void this.router.navigate(['/initiatives', 'new']);
  }

  editInitiative(initiative: InitiativeHierarchy): void {
    void this.router.navigate(['/initiatives', initiative.id]);
  }

  /** A new epic is parented by the initiative it was started from, which the address carries. */
  newEpic(initiativeId: string): void {
    void this.router.navigate(['/epics', 'new'], { queryParams: { initiativeId } });
  }

  editEpic(epic: EpicHierarchy): void {
    void this.router.navigate(['/epics', epic.id]);
  }

  /** A card and a row have one line for a whole document, so each carries its first line of prose. */
  summariseBrief(description: string): string {
    return summariseMarkdown(description, 'No brief written yet.');
  }

  summariseSummary(summary: string): string {
    return summariseMarkdown(summary, 'No summary written yet.');
  }

  /** What an initiative rolls up to, counted in words so a single epic or story reads as one. */
  rollUp(initiative: InitiativeHierarchy): string {
    return `${pluralize(initiative.epicCount, 'epic')} · ${pluralize(initiative.storyCount, 'story', 'stories')}`;
  }

  async deleteInitiative(initiative: InitiativeHierarchy): Promise<void> {
    if (
      await this.confirm().open(
        `Delete ${initiative.name}?`,
        'The initiative can be deleted only after all of its epics have been moved or removed.',
        'Delete initiative',
      )
    ) {
      await this.service.deleteInitiative(initiative.id);
    }
  }

  async deleteEpic(epic: EpicHierarchy): Promise<void> {
    if (
      await this.confirm().open(
        `Delete ${epic.name}?`,
        'The epic can be deleted only when it contains no stories.',
        'Delete epic',
      )
    ) {
      await this.service.deleteEpic(epic.id);
    }
  }
}
