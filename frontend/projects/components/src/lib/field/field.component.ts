import { Component, booleanAttribute, input } from '@angular/core';
@Component({ selector: 'qbc-field', templateUrl: './field.component.html', styleUrl: './field.component.scss', host: { '[class.qbc-full]': 'full()' } })
export class FieldComponent {
  readonly label = input('Label'); readonly hint = input('');
  readonly required = input(false, { transform: booleanAttribute }); readonly full = input(false, { transform: booleanAttribute });
}
