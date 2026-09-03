import { DOCUMENT } from '@angular/core';
import { Component, inject, input } from '@angular/core';

@Component({
  selector: 'qbc-skip-link',
  templateUrl: './skip-link.component.html',
  styleUrl: './skip-link.component.scss',
})
export class SkipLinkComponent {
  private readonly document = inject(DOCUMENT);
  readonly target = input('main-content');
  readonly label = input('Skip to content');

  /**
   * Moves focus to the target directly. A bare `#id` href resolves against `<base href>`,
   * so following it navigates the router and can discard the very focus the link exists to
   * place. The href is kept so the control still reads and behaves as a link.
   */
  skip(event: Event): void {
    const target = this.document.getElementById(this.target());
    if (!target) {
      return;
    }

    event.preventDefault();
    target.focus();
  }
}
