// <qbc-button variant="primary|secondary|quiet|danger" size="md|sm|xs" full disabled>
//
// The action component. Every button in the product is one of these four variants.
// Sizes exist because the mock tightens buttons inside table rows (sm) and card
// footers (xs) rather than introducing separate components for them.

import { QbcElement, esc } from './qbc-base.js';

class QbcButton extends QbcElement {
  static get observedAttributes() { return ['variant', 'size', 'full', 'disabled', 'type']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: inline-block; }
      :host([full]) { display: block; }

      button {
        display: inline-flex;
        width: 100%;
        min-height: var(--qbc-button-h, 40px);
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 9px 16px;
        border: 1px solid var(--qbc-accent);
        border-radius: var(--qbc-r-control);
        background: var(--qbc-accent);
        color: #fff;
        font-size: var(--qbc-fs-base);
        font-weight: var(--qbc-fw-button);
      }
      :host(:not([full])) button { width: auto; }
      button:hover { background: var(--qbc-accent-dark); border-color: var(--qbc-accent-dark); }

      :host([variant="secondary"]) button {
        padding: 9px 15px;
        border-color: var(--qbc-line);
        background: var(--qbc-panel);
        color: var(--qbc-ink);
      }
      :host([variant="secondary"]) button:hover { background: var(--qbc-soft); }

      :host([variant="quiet"]) button {
        padding: 8px 11px;
        border-color: transparent;
        background: transparent;
        color: var(--qbc-ink-soft);
      }
      :host([variant="quiet"]) button:hover { background: var(--qbc-soft); }

      :host([variant="danger"]) button {
        padding: 9px 15px;
        border-color: var(--qbc-danger);
        background: var(--qbc-danger);
        color: #fff;
      }
      /* The mock defines no hover for the destructive action. Darkening the fill keeps
         the affordance consistent without changing the resting appearance. */
      :host([variant="danger"]) button:hover { filter: brightness(.92); }

      :host([size="sm"]) button { min-height: 34px; padding: 5px 9px; font-size: var(--qbc-fs-xs); }
      :host([size="xs"]) button { min-height: 30px; padding: 3px 8px; font-size: var(--qbc-fs-xs); }

      :host([disabled]) button { cursor: not-allowed; opacity: .52; }
      :host([disabled]) button:hover {
        background: var(--qbc-accent);
        border-color: var(--qbc-accent);
        filter: none;
      }
      :host([variant="secondary"][disabled]) button:hover { background: var(--qbc-panel); }
      :host([variant="quiet"][disabled]) button:hover { background: transparent; }
      :host([variant="danger"][disabled]) button:hover { background: var(--qbc-danger); }

      ::slotted([slot="leading"]) { margin-right: -1px; }
    `;
  }

  template() {
    const type = ['button', 'submit', 'reset'].includes(this.attr('type')) ? this.attr('type') : 'button';
    return `
      <button type="${esc(type)}" ${this.battr('disabled') ? 'disabled' : ''}>
        <slot name="leading"></slot>
        <slot></slot>
      </button>
    `;
  }
}

customElements.define('qbc-button', QbcButton);
