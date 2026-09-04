import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { BrandComponent, ButtonComponent, PasscodeInputComponent } from '@qbc/components';
import { SESSION_SERVICE } from '../../core/session.service.contract';
import { VERSION_SERVICE } from '../../core/version.service.contract';

const PASSCODE_LENGTH = 4;
const SUCCESS_HOLD_MS = 700;

@Component({
  selector: 'app-unlock-page',
  imports: [BrandComponent, ButtonComponent, PasscodeInputComponent],
  templateUrl: './unlock-page.component.html',
  styleUrl: './unlock-page.component.scss',
})
export class UnlockPageComponent {
  private readonly field = viewChild.required(PasscodeInputComponent);
  private readonly router = inject(Router);
  readonly session = inject(SESSION_SERVICE);
  readonly version = inject(VERSION_SERVICE);
  readonly passcode = signal('');
  readonly invalid = signal(false);
  readonly accepted = signal(false);
  readonly length = PASSCODE_LENGTH;

  constructor() {
    effect(() => {
      if (this.session.isUnlocked() && !this.accepted()) {
        void this.router.navigate(['/board']);
      }
    });
  }

  entered(value: string): void {
    this.passcode.set(value);
    this.invalid.set(false);
  }

  async submit(): Promise<void> {
    if (this.passcode().length !== PASSCODE_LENGTH || this.session.pending() || this.accepted()) {
      return;
    }

    if (!(await this.session.unlock(this.passcode()))) {
      this.invalid.set(true);
      window.setTimeout(() => this.reset(), SUCCESS_HOLD_MS);
      return;
    }

    this.accepted.set(true);
    window.setTimeout(() => void this.router.navigate(['/board']), SUCCESS_HOLD_MS);
  }

  private reset(): void {
    this.invalid.set(false);
    this.passcode.set('');
    this.field().writeValue('');
    this.field().focus();
  }
}
