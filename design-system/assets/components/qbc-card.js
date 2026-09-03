// <qbc-card padding="none|md|lg" interactive raised>
//
// The general bordered container at the large radius. The mock draws this same box
// three times under three names — .initiative-card, .assistant-card and .data-list —
// differing only in padding, so one component with a padding enum replaces all three.
// `none` is the .data-list case, where rows own their own padding and the card exists
// only to clip them; `lg` is the .assistant-card value.
//
// `overflow: hidden` is not cosmetic: it is what keeps a full-bleed child, such as a
// row divider or a header fill, inside the rounded corner.

import { QbcElement } from './qbc-base.js';

class QbcCard extends QbcElement {
  static get observedAttributes() { return ['padding', 'interactive', 'raised']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: block;
        overflow: hidden;
        padding: 18px;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-xl);
        background: var(--qbc-panel);
      }
      :host([padding="none"]) { padding: 0; }
      :host([padding="lg"]) { padding: 23px; }

      :host([interactive]) { cursor: pointer; }
      :host([interactive]:hover) { background: var(--qbc-surface-hover); }

      :host([raised]) { box-shadow: var(--qbc-shadow-card); }
    `;
  }

  template() {
    return '<slot></slot>';
  }
}

customElements.define('qbc-card', QbcCard);
