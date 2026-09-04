import { CanDeactivateFn } from '@angular/router';

/** A page that holds a markdown document a navigation could discard. */
export interface EditsADocument {
  confirmLeaving(): Promise<boolean>;
}

/**
 * Keeps a navigation away from a document from discarding unsaved markdown without asking. The page
 * owns the question, because it is the only thing that knows whether its document has changed.
 */
export const unsavedDocumentGuard: CanDeactivateFn<EditsADocument> = (component) =>
  component.confirmLeaving();
