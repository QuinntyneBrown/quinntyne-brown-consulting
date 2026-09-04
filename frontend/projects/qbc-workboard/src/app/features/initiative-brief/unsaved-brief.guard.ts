import { CanDeactivateFn } from '@angular/router';
import { InitiativeBriefPageComponent } from './initiative-brief-page.component';

/**
 * Keeps a navigation away from the brief from discarding unsaved markdown without asking. The page
 * owns the question, because it is the only thing that knows whether the brief has changed.
 */
export const unsavedBriefGuard: CanDeactivateFn<InitiativeBriefPageComponent> = (component) =>
  component.confirmLeaving();
