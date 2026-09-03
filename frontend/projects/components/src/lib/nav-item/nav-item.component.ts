import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../icon/icon-name';

@Component({ selector: 'qbc-nav-item', imports: [IconComponent, RouterLink, RouterLinkActive], templateUrl: './nav-item.component.html', styleUrl: './nav-item.component.scss' })
export class NavItemComponent {
  readonly icon = input<IconName>('board'); readonly label = input('Destination'); readonly href = input.required<string>(); readonly activated = output<void>();
}
