import { Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
import { DialogCloseReason } from './dialog-close-reason';

@Component({
  selector: 'qbc-dialog',
  imports: [IconButtonComponent],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss',
})
export class DialogComponent {
  private static nextId = 1;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private returnFocus: HTMLElement | null = null;
  readonly title = input('Dialog');
  readonly subtitle = input('');
  readonly size = input<'md' | 'sm'>('md');
  readonly closeLabel = input('Close dialog');
  readonly closed = output<DialogCloseReason>();
  readonly isOpen = signal(false);
  readonly titleId = `qbc-dialog-title-${DialogComponent.nextId++}`;

  open(): void {
    if (this.dialog().nativeElement.open) return;
    this.returnFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.dialog().nativeElement.showModal();
    this.isOpen.set(true);
  }
  close(reason: DialogCloseReason = 'programmatic'): void {
    if (!this.dialog().nativeElement.open) return;
    this.dialog().nativeElement.close();
    this.isOpen.set(false);
    this.closed.emit(reason);
    this.returnFocus?.focus();
    this.returnFocus = null;
  }
  cancel(event: Event): void {
    event.preventDefault();
    this.close('escape');
  }
  backdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close('backdrop');
  }
}
