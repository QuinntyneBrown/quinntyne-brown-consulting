import { Component, booleanAttribute, input } from '@angular/core';
import { ButtonSize, ButtonType, ButtonVariant } from './button.types';

@Component({
  selector: 'qbc-button',
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<ButtonType>('button');
  readonly full = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
}
