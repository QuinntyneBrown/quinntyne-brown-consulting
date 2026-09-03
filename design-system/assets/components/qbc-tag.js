// <qbc-tag>Research</qbc-tag>
//
// The neutral metadata chip, used for assistant specialties. It has no attributes on
// purpose: a tag is free text and is never colour-coded by value. Anything that needs
// to carry meaning through colour is a <qbc-pill> instead, and the squarer radius here
// is what keeps the two readable apart at a glance.

import { QbcElement } from './qbc-base.js';

class QbcTag extends QbcElement {
  static get observedAttributes() { return []; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: var(--qbc-r-2xs);
        color: var(--qbc-ink-soft);
        background: var(--qbc-soft);
        font-size: var(--qbc-fs-2xs);
      }
    `;
  }

  template() {
    return '<slot></slot>';
  }
}

customElements.define('qbc-tag', QbcTag);
