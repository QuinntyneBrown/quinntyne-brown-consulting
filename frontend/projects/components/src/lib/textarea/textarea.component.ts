import { Component, booleanAttribute, computed, effect, forwardRef, input, output } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessor } from '../forms/value-accessor';

@Component({
  selector: 'qbc-textarea', templateUrl: './textarea.component.html', styleUrl: './textarea.component.scss',
  host: { '[class.qbc-full]': 'full()' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextareaComponent), multi: true }]
})
export class TextareaComponent extends ValueAccessor<string> {
  private static nextId = 1;
  readonly label = input(''); readonly value = input<string>(); readonly placeholder = input(''); readonly hint = input('');
  readonly required = input(false, { transform: booleanAttribute }); readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute }); readonly full = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null); readonly valueChange = output<string>();
  readonly controlId = `qbc-textarea-${TextareaComponent.nextId++}`; readonly hintId = `${this.controlId}-hint`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  constructor() { super(''); effect(() => { const value = this.value(); if (value !== undefined) this.controlValue.set(value); }); }
  change(value: string): void { this.updateValue(value); this.valueChange.emit(value); }
}
