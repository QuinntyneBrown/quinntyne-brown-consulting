// <qbc-form-error>Error text</qbc-form-error>
//
// The inline validation summary that sits above a dialog's form grid. It states what is
// missing rather than that something went wrong, so the slot takes a sentence, not a code.
//
// Improvement on the mock: the mock renders this as a plain paragraph, which appears
// silently — a screen-reader user submitting the form gets no indication of why nothing
// happened. This carries role="alert", so the text is announced the moment it lands.
// The role is only applied when the author has not already chosen one, leaving room for
// a politer role="status" where the message is not urgent.
//
// The element is display:block but collapses when it has no content, so a page can leave
// one in the markup permanently and fill it on failure. Note that :empty counts text
// nodes: an instance written across two lines holds whitespace and will not collapse.

import { QbcElement } from './qbc-base.js';

class QbcFormError extends QbcElement {
  // No attributes: the message is the slotted content. Without observed attributes there
  // is nothing to re-render, so no attributeChangedCallback is defined.
  static get observedAttributes() { return []; }

  styles() {
    return `
      :host {
        display: block;
        margin: 0 0 18px;
        padding: 10px 12px;
        border-radius: var(--qbc-r-sm);
        color: var(--qbc-danger);
        background: var(--qbc-danger-soft);
        font-size: var(--qbc-fs-xs);
      }
      :host(:empty) { display: none; }
    `;
  }

  template() {
    return `<slot></slot>`;
  }

  afterRender() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'alert');
  }
}

customElements.define('qbc-form-error', QbcFormError);
