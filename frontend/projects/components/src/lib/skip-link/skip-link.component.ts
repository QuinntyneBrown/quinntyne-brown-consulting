import { Component, input } from '@angular/core';
@Component({
  selector: 'qbc-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrl: './skip-link.component.scss',
})
export class SkipLinkComponent {
  readonly target = input('main-content');
  readonly label = input('Skip to content');
}
