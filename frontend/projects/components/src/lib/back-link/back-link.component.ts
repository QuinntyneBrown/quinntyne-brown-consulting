import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * The way back out of a page that was opened from a list. It stays a link rather than a button so
 * it keeps a link's role, its address, and the browser conveniences that come with one.
 */
@Component({
  selector: 'qbc-back-link',
  imports: [RouterLink],
  templateUrl: './back-link.component.html',
  styleUrl: './back-link.component.scss',
})
export class BackLinkComponent {
  readonly href = input.required<string>();
  readonly label = input('Back');
}
