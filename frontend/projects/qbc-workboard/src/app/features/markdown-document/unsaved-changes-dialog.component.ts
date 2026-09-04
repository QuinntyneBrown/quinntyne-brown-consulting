import { Component, output, viewChild } from '@angular/core';
import { ButtonComponent, DialogComponent } from '@qbc/components';

/**
 * The question raised before a navigation would discard unsaved markdown. It offers the three
 * choices and reports which one was taken; the page answers them, because only the page knows how
 * to save the record the document belongs to.
 */
@Component({
  selector: 'app-unsaved-changes-dialog',
  imports: [ButtonComponent, DialogComponent],
  templateUrl: './unsaved-changes-dialog.component.html',
})
export class UnsavedChangesDialogComponent {
  private readonly dialog = viewChild.required<DialogComponent>('dialog');
  readonly keepEditing = output<void>();
  readonly discardChanges = output<void>();
  readonly saveAndContinue = output<void>();
  /** Escape or the close control, which means the writer is staying with the document. */
  readonly dismissed = output<void>();

  open(): void {
    this.dialog().open();
  }

  close(): void {
    this.dialog().close();
  }
}
