// <qbc-pill tone="ready|active|done|available|draft|todo|toDo|progress|inProgress|planned|limited|archived|muted|unavailable|completed">Ready</qbc-pill>
//
// The status label. One component covers the lifecycle, readiness, board, sprint and
// availability vocabularies, because they are all the same object: a short word tinted
// by meaning. The word is always slotted, never implied by the tone, so status never
// depends on colour alone.
//
// Three defects in the mock stylesheet are deliberately fixed here:
//   1. `.pill.completed` has no rule at all, so a completed sprint renders untinted.
//   2. `.pill.todo` and `.pill.progress` do not match the camelCase `toDo` and
//      `inProgress` values the data actually uses, so those pills fall through unstyled.
//      Both spellings are accepted and resolve to the same tone.
//   3. `available`, `limited` and `unavailable` have no rules, so the assistant
//      availability vocabulary has no pill treatment.

import { QbcElement } from './qbc-base.js';

class QbcPill extends QbcElement {
  static get observedAttributes() { return ['tone']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      /* The neutral tone is the base, so the default tone needs no attribute. */
      :host {
        display: inline-flex;
        gap: 5px;
        width: max-content;
        align-items: center;
        padding: 4px 8px;
        border-radius: var(--qbc-r-pill);
        color: var(--qbc-ink-soft);
        background: var(--qbc-soft);
        font-size: var(--qbc-fs-2xs);
        font-weight: var(--qbc-fw-semibold);
      }

      :host([tone="ready"]),
      :host([tone="active"]),
      :host([tone="done"]),
      :host([tone="available"]) {
        color: var(--qbc-accent-dark);
        background: var(--qbc-accent-soft);
      }

      :host([tone="draft"]),
      :host([tone="todo"]),
      :host([tone="toDo"]) {
        color: var(--qbc-blue);
        background: var(--qbc-blue-soft);
      }

      :host([tone="progress"]),
      :host([tone="inProgress"]),
      :host([tone="planned"]),
      :host([tone="limited"]) {
        color: var(--qbc-amber);
        background: var(--qbc-amber-soft);
      }

      /* Restated rather than left to the base rule, so all fifteen tones are visible
         in one place and a future change to the base cannot silently retint them. */
      :host([tone="archived"]),
      :host([tone="muted"]),
      :host([tone="unavailable"]),
      :host([tone="completed"]) {
        color: var(--qbc-ink-soft);
        background: var(--qbc-soft);
      }
    `;
  }

  template() {
    return '<slot></slot>';
  }
}

customElements.define('qbc-pill', QbcPill);
