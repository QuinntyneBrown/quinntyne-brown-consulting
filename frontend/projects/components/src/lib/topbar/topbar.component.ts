import { Component, input, output } from '@angular/core';
import { IconButtonComponent } from '../icon-button/icon-button.component';
@Component({ selector: 'qbc-topbar', imports: [IconButtonComponent], templateUrl: './topbar.component.html', styleUrl: './topbar.component.scss' })
export class TopbarComponent {
  readonly breadcrumb = input('Workspace / Board'); readonly navOpen = input(false); readonly menuLabel = input('Open navigation'); readonly menuToggled = output<void>();
}
