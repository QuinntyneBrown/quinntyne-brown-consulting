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
import { ValueAccessor } from '../forms/value-accessor';

@Component({
  selector: 'qbc-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrl: './checkbox.component.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CheckboxComponent), multi: true },
  ],
})
export class CheckboxComponent extends ValueAccessor<boolean> {
  private static nextId = 1;
  readonly label = input('');
  readonly value = input<boolean>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  readonly valueChange = output<boolean>();
  readonly controlId = `qbc-checkbox-${CheckboxComponent.nextId++}`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  constructor() {
    super(false);
    effect(() => {
      const value = this.value();
      if (value !== undefined) this.controlValue.set(value);
    });
  }
  change(value: boolean): void {
    this.updateValue(value);
    this.valueChange.emit(value);
  }
}
