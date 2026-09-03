import {
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessor } from '../forms/value-accessor';

/**
 * A fixed-length numeric passcode field. One real input carries the value and the boxes
 * render it, so paste, mobile numeric keypads, and one-time-code autofill all work and
 * there is a single focus target.
 */
@Component({
  selector: 'qbc-passcode-input',
  templateUrl: './passcode-input.component.html',
  styleUrl: './passcode-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasscodeInputComponent),
      multi: true,
    },
  ],
})
export class PasscodeInputComponent extends ValueAccessor<string> {
  private static nextId = 1;
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly focused = signal(false);

  readonly label = input('Passcode');
  readonly length = input(4);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly accepted = input(false, { transform: booleanAttribute });
  readonly describedBy = input<string | null>(null);
  readonly completed = output<string>();
  readonly valueChange = output<string>();

  readonly controlId = `qbc-passcode-input-${PasscodeInputComponent.nextId++}`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly boxes = computed(() => Array.from({ length: this.length() }, (_, index) => index));

  constructor() {
    super('');
  }

  isFilled(index: number): boolean {
    return index < this.controlValue().length;
  }

  isActive(index: number): boolean {
    return this.focused() && !this.isDisabled() && index === this.controlValue().length;
  }

  change(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, this.length());
    this.field().nativeElement.value = digits;
    this.updateValue(digits);
    this.valueChange.emit(digits);
    if (digits.length === this.length()) {
      this.completed.emit(digits);
    }
  }

  setFocused(value: boolean): void {
    this.focused.set(value);
    if (!value) {
      this.touched();
    }
  }

  focus(): void {
    this.field().nativeElement.focus();
  }
}
