import { Component, booleanAttribute, computed, effect, forwardRef, input, output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ValueAccessor } from '../forms/value-accessor';
import { SelectItem, SelectOptionGroup, SelectValue } from './select-option';

@Component({
  selector: 'qbc-select', imports: [FormsModule], templateUrl: './select.component.html', styleUrl: './select.component.scss',
  host: { '[class.qbc-full]': 'full()' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectComponent), multi: true }]
})
export class SelectComponent extends ValueAccessor<SelectValue> {
  private static nextId = 1;
  readonly label = input(''); readonly value = input<SelectValue>(); readonly options = input<readonly SelectItem[]>([]); readonly hint = input('');
  readonly required = input(false, { transform: booleanAttribute }); readonly disabled = input(false, { transform: booleanAttribute });
  readonly full = input(false, { transform: booleanAttribute }); readonly labelHidden = input(false, { transform: booleanAttribute });
  readonly size = input<'md' | 'sm'>('md'); readonly ariaLabel = input<string | null>(null); readonly valueChange = output<SelectValue>();
  readonly controlId = `qbc-select-${SelectComponent.nextId++}`; readonly hintId = `${this.controlId}-hint`;
  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  constructor() { super(null); effect(() => { const value = this.value(); if (value !== undefined) this.controlValue.set(value); }); }
  isGroup(item: SelectItem): item is SelectOptionGroup { return 'options' in item; }
  change(value: SelectValue): void { this.updateValue(value); this.valueChange.emit(value); }
}
