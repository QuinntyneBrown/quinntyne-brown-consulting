import {
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

/**
 * The dropzone and the file picker behind it. A native file input cannot live in an application
 * template, so it lives here, hidden but real: the keyboard, the file dialog, and Playwright's
 * `setInputFiles` all address the element the browser already knows how to drive.
 */
@Component({
  selector: 'qbc-file-drop',
  templateUrl: './file-drop.component.html',
  styleUrl: './file-drop.component.scss',
})
export class FileDropComponent {
  private static nextId = 1;

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  /**
   * Dragging across a page fires enter and leave on every element crossed, so a depth counter is
   * what keeps the zone from flickering as the pointer passes between its own children.
   */
  private depth = 0;

  readonly heading = input('Drop files here');
  readonly hint = input<string | null>(null);
  readonly chooseLabel = input('Choose files');
  /**
   * A file input is a button in the accessibility tree, so it is named apart from the visible
   * control that opens it; sharing one name would leave two buttons called the same thing.
   */
  readonly inputLabel = input('Attach files');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly filesSelected = output<readonly File[]>();

  readonly controlId = `qbc-file-drop-${FileDropComponent.nextId++}`;
  readonly isDragging = signal(false);

  choose(): void {
    if (!this.disabled()) this.field().nativeElement.click();
  }

  selected(input: HTMLInputElement): void {
    this.emit(input.files);
    // Clearing the value lets the same file be chosen twice running, which the browser would
    // otherwise ignore because the input's value has not changed.
    input.value = '';
  }

  dragEnter(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.depth += 1;
    this.isDragging.set(true);
  }

  dragOver(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }

  dragLeave(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    this.depth = Math.max(0, this.depth - 1);
    if (this.depth === 0) this.isDragging.set(false);
  }

  drop(event: DragEvent): void {
    if (!this.carriesFiles(event)) return;
    event.preventDefault();
    this.depth = 0;
    this.isDragging.set(false);
    this.emit(event.dataTransfer?.files ?? null);
  }

  private carriesFiles(event: DragEvent): boolean {
    return !this.disabled() && Array.from(event.dataTransfer?.types ?? []).includes('Files');
  }

  private emit(files: FileList | null): void {
    const selection = Array.from(files ?? []);
    if (selection.length > 0) this.filesSelected.emit(selection);
  }
}
