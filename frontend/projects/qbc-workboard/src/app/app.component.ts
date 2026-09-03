import { Component, effect, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SESSION_SERVICE } from './core/session.service.contract';

const UNLOCK_ROUTE = '/unlock';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly session = inject(SESSION_SERVICE);

  constructor() {
    // A token the server rejects mid-session is dropped by the API interceptor. Returning
    // to the passcode page here means the user is not left on a page that cannot load.
    effect(() => {
      if (!this.session.isUnlocked() && !this.router.url.startsWith(UNLOCK_ROUTE)) {
        void this.router.navigate([UNLOCK_ROUTE]);
      }
    });
  }
}
