import { Component, booleanAttribute, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

export type IconButtonVariant = 'default' | 'bare';

@Component({
  selector: 'qbc-icon-button',
  imports: [IconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
})
export class IconButtonComponent {
  readonly icon = input<IconName>('close');
  readonly label = input.required<string>();
  readonly variant = input<IconButtonVariant>('default');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly ariaExpanded = input<boolean | null>(null);
}
