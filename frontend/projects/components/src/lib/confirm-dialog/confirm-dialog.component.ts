import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'qbc-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  private static nextId = 1;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly titleId = `confirm-title-${ConfirmDialogComponent.nextId++}`;
  title = '';
  copy = '';
  confirmLabel = 'Confirm';
  private resolve: ((confirmed: boolean) => void) | null = null;

  open(title: string, copy: string, confirmLabel = 'Confirm'): Promise<boolean> {
    this.title = title;
    this.copy = copy;
    this.confirmLabel = confirmLabel;
    this.dialog().nativeElement.showModal();
    return new Promise<boolean>(resolve => { this.resolve = resolve; });
  }

  close(confirmed: boolean): void {
    this.dialog().nativeElement.close();
    this.resolve?.(confirmed);
    this.resolve = null;
  }
}
