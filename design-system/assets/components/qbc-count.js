// <qbc-count value="3">
//
// The quantity badge on board column headers. The capsule shape is what distinguishes
// a quantity from the squircle estimate chip <qbc-points>: the two sit at nearly the
// same size in the same views, and radius is the only thing telling them apart, so the
// pill radius here and the small radius there are load-bearing rather than decorative.
//
// It also sits on the panel surface, not the soft one, because a board column is
// already soft-filled and a soft badge would disappear into it.

import { QbcElement, esc } from './qbc-base.js';

class QbcCount extends QbcElement {
  static get observedAttributes() { return ['value']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: inline-block; }

      .count {
        display: grid;
        min-width: 26px;
        height: 26px;
        padding: 0 7px;
        place-items: center;
        border-radius: var(--qbc-r-pill);
        color: var(--qbc-ink-soft);
        background: var(--qbc-panel);
        font-size: var(--qbc-fs-xs);
      }
    `;
  }

  template() {
    return `<span class="count">${esc(this.attr('value', '0'))}</span>`;
  }
}

customElements.define('qbc-count', QbcCount);
