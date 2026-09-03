// <qbc-toast tone="default|error">
//
// A transient confirmation or error. It never moves focus and it never asks for a
// decision — a message that needs an answer is a dialog, not a toast.
//
// The toast itself carries no aria-live. A live region has to exist in the DOM before
// the message is inserted into it, so the region is the consumer's, not the component's.
// Place these inside one:
//
//   <div class="toast-region" aria-live="polite" aria-atomic="true">
//     <qbc-toast>QBC-101 is ready for a sprint.</qbc-toast>
//   </div>

import { QbcElement } from './qbc-base.js';

class QbcToast extends QbcElement {
  static get observedAttributes() { return ['tone']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; max-width: 380px; }

      /* The box is on an inner element rather than the host so that @keyframes declared
         in this shadow root resolve in the same tree scope as the animation-name. */
      .toast {
        padding: 12px 16px;
        border-radius: var(--qbc-r-control);
        color: #fff;
        background: var(--qbc-ink);
        box-shadow: var(--qbc-shadow-overlay);
        font-size: var(--qbc-fs-sm);
        animation: toast-in var(--qbc-dur-base) var(--qbc-ease);
      }

      :host([tone="error"]) .toast { background: var(--qbc-danger); }

      /* The reduced-motion retune in tokens.css collapses --qbc-dur-base to 1ms, so the
         entrance neutralises itself without a second media query. */
      @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } }
    `;
  }

  template() {
    return `<div class="toast"><slot></slot></div>`;
  }
}

customElements.define('qbc-toast', QbcToast);
