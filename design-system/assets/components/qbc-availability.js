// <qbc-availability status="available|limited|unavailable">
//
// Assistant availability: a status dot and the state read out in words.
//
// The mock hard-codes the dot to a single green in `.availability::before`, with no
// per-state rule anywhere, so Limited and Unavailable render an identical green dot
// and the colour carries no information at all. This restores three distinct dots:
// green for available, amber for limited, and the faint ink for unavailable. The word
// is always rendered beside the dot, so the state never rests on colour alone.

import { QbcElement, esc } from './qbc-base.js';

const STATUSES = ['available', 'limited', 'unavailable'];

class QbcAvailability extends QbcElement {
  static get observedAttributes() { return ['status']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: flex;
        gap: 7px;
        align-items: center;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }

      :host::before {
        width: 7px;
        height: 7px;
        border-radius: var(--qbc-r-round);
        background: var(--qbc-dot-available);
        content: "";
      }
      :host([status="limited"])::before { background: var(--qbc-amber); }
      :host([status="unavailable"])::before { background: var(--qbc-ink-faint); }
    `;
  }

  template() {
    const status = STATUSES.includes(this.attr('status')) ? this.attr('status') : 'available';
    const label = status[0].toUpperCase() + status.slice(1);
    return `<span>${esc(label)}</span>`;
  }
}

customElements.define('qbc-availability', QbcAvailability);
