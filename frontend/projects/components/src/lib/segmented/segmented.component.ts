import { Component, input, output } from '@angular/core';
import { SegmentedOption } from './segmented-option';

/**
 * A small set of mutually exclusive choices presented as one control. Each choice reports whether
 * it is the current one through `aria-pressed`, so the selection is legible without relying on the
 * colour that shows it.
 */
@Component({
  selector: 'qbc-segmented',
  templateUrl: './segmented.component.html',
  styleUrl: './segmented.component.scss',
})
export class SegmentedComponent {
  readonly options = input.required<readonly SegmentedOption[]>();
  readonly selected = input.required<string>();
  readonly ariaLabel = input<string | null>(null);
  readonly selectedChange = output<string>();

  choose(value: string): void {
    if (value !== this.selected()) this.selectedChange.emit(value);
  }
}
