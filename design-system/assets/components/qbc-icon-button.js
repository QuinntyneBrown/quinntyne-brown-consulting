// <qbc-icon-button icon="close" label="Close dialog" variant="default|bare" disabled>
//
// The icon-only action. Because it carries no visible text, `label` is the control's
// only accessible name, which is why it is a required attribute rather than a slot.
// The two variants are the two treatments the mock actually draws: a bordered square
// in toolbars and card footers, and a borderless square in dialog headers.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-icon.js';

class QbcIconButton extends QbcElement {
  static get observedAttributes() { return ['icon', 'label', 'variant', 'disabled']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: inline-block; }

      button {
        display: grid;
        /* A square at button height, so it lines up with <qbc-button> in a toolbar. */
        width: var(--qbc-button-h, 40px);
        min-height: var(--qbc-button-h, 40px);
        place-items: center;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-control);
        background: var(--qbc-panel);
        color: var(--qbc-ink);
        font-weight: var(--qbc-fw-button);
      }
      /* The mock gives .icon-button no hover state at all, unlike every other button
         class beside it. This borrows the secondary button's fill so the affordance
         matches without changing the resting appearance. */
      button:hover { background: var(--qbc-soft); }

      /* .dialog-head .icon-button — smaller and borderless, for the close affordance. */
      :host([variant="bare"]) button {
        width: 34px;
        min-height: 34px;
        border: 0;
        font-size: var(--qbc-fs-2xl);
      }

      :host([disabled]) button:hover { background: var(--qbc-panel); }
    `;
  }

  template() {
    // The bare variant's 18px comes from the dialog-head override; everything else
    // takes the icon set's own default box.
    const size = this.attr('variant') === 'bare' ? '18' : '16';
    return `
      <button type="button" aria-label="${esc(this.attr('label', 'Action'))}" ${this.battr('disabled') ? 'disabled' : ''}>
        <qbc-icon name="${esc(this.attr('icon', 'close'))}" size="${size}"></qbc-icon>
      </button>
    `;
  }
}

customElements.define('qbc-icon-button', QbcIconButton);
