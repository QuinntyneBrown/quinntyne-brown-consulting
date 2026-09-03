import { Component, viewChild } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'qbc-confirm-dialog',
  imports: [ButtonComponent, DialogComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  private static nextId = 1;
  private readonly dialog = viewChild.required(DialogComponent);
  readonly titleId = `confirm-title-${ConfirmDialogComponent.nextId++}`;
  title = '';
  copy = '';
  confirmLabel = 'Confirm';
  private resolve: ((confirmed: boolean) => void) | null = null;

  open(title: string, copy: string, confirmLabel = 'Confirm'): Promise<boolean> {
    this.title = title;
    this.copy = copy;
    this.confirmLabel = confirmLabel;
    this.dialog().open();
    return new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
  }

  close(confirmed: boolean): void {
    const resolve = this.resolve;
    this.resolve = null;
    this.dialog().close();
    resolve?.(confirmed);
  }
}
