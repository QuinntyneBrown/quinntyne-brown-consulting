import {
  Component,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';
import { ValueAccessor } from '../forms/value-accessor';

export type TextInputType = 'text' | 'email' | 'password' | 'number' | 'date' | 'search';

@Component({
  selector: 'qbc-text-input',
  imports: [IconComponent],
  templateUrl: './text-input.component.html',
  styleUrl: './text-input.component.scss',
  host: { '[class.qbc-full]': 'full()' },
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextInputComponent), multi: true },
  ],
})
export class TextInputComponent extends ValueAccessor<string> {
  private static nextId = 1;
  readonly label = input('');
  readonly value = input<string>();
  readonly placeholder = input('');
  readonly type = input<TextInputType>('text');
  readonly hint = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly full = input(false, { transform: booleanAttribute });
  readonly labelHidden = input(false, { transform: booleanAttribute });
  readonly size = input<'md' | 'sm'>('md');
  readonly icon = input<IconName | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly valueChange = output<string>();
  readonly controlId = `qbc-text-input-${TextInputComponent.nextId++}`;
  readonly hintId = `${this.controlId}-hint`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  constructor() {
    super('');
    effect(() => {
      const value = this.value();
      if (value !== undefined) this.controlValue.set(value);
    });
  }
  change(value: string): void {
    this.updateValue(value);
    this.valueChange.emit(value);
  }
}
