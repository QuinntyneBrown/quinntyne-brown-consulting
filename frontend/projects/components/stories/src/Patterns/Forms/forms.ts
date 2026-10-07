import { FormControl, FormGroup, Validators } from '@angular/forms';

/** A fresh story form per render, so Controls and story switches never share state. */
export function storyForm(
  value: {
    title?: string;
    epicId?: string | null;
    assistantId?: string | null;
    description?: string;
    acceptanceCriteria?: string;
    points?: number | null;
  } = {},
): FormGroup {
  return new FormGroup({
    title: new FormControl(value.title ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    epicId: new FormControl<string | null>(value.epicId ?? null, Validators.required),
    assistantId: new FormControl<string | null>(value.assistantId ?? null),
    description: new FormControl(value.description ?? '', { nonNullable: true }),
    acceptanceCriteria: new FormControl(value.acceptanceCriteria ?? '', { nonNullable: true }),
    points: new FormControl<number | null>(value.points ?? null),
  });
}

/** The story editor's field grid, bound to `form` with `formControlName`. */
export const storyFields = `
  <qbc-form-grid>
    <qbc-text-input label="Title" required full autocomplete="off" formControlName="title" />
    <qbc-select label="Epic" required [options]="epicOptions" formControlName="epicId" />
    <qbc-select label="Owner" [options]="ownerOptions" formControlName="assistantId" />
    <qbc-textarea
      label="Description or user story"
      full
      placeholder="As a consultant, I want … so that …"
      formControlName="description"
    />
    <qbc-textarea
      label="Acceptance criteria"
      full
      hint="One observable outcome per line."
      formControlName="acceptanceCriteria"
    />
    <qbc-select
      label="Story points"
      hint="Estimate before marking the story ready."
      [options]="pointOptions"
      formControlName="points"
    />
  </qbc-form-grid>
`;
