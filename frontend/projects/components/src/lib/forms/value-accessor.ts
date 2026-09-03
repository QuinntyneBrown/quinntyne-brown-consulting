import { signal, WritableSignal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

export abstract class ValueAccessor<T> implements ControlValueAccessor {
  readonly controlValue: WritableSignal<T>;
  readonly formDisabled = signal(false);
  private onChange: (value: T) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected constructor(private readonly initialValue: T) {
    this.controlValue = signal(initialValue);
  }

  writeValue(value: T | null | undefined): void { this.controlValue.set(value ?? this.initialValue); }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { this.formDisabled.set(disabled); }
  protected updateValue(value: T): void { this.controlValue.set(value); this.onChange(value); }
  touched(): void { this.onTouched(); }
}
