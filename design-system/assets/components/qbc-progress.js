// <qbc-progress value="0" label="" mini>
//
// The completion meter used by the sprint hero and by every epic row. One component
// covers both because the mock's `.mini-progress` differs only in width.
//
// Improvement on the mock: the mock's markup carries an aria-label on a plain div and
// nothing else, so assistive technology announces a name with no value and no role.
// This renders the full triplet — role="progressbar", aria-valuemin, aria-valuemax and
// aria-valuenow — alongside that label, and clamps the value into 0-100 so a bad input
// cannot produce a bar that overflows its track or an out-of-range announcement.

import { QbcElement, esc } from './qbc-base.js';

class QbcProgress extends QbcElement {
  static get observedAttributes() { return ['value', 'label', 'mini']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }
      :host([mini]) { width: 110px; }

      .track {
        overflow: hidden;
        height: 7px;
        border-radius: var(--qbc-r-md);
        background: var(--qbc-line);
      }
      .bar {
        height: 100%;
        border-radius: inherit;
        background: var(--qbc-accent);
      }
    `;
  }

  template() {
    const raw = Number(this.attr('value', '0'));
    const value = Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0));
    const label = this.attr('label');
    return `
      <div class="track"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${value}"
        ${label ? `aria-label="${esc(label)}"` : ''}>
        <div class="bar" style="width:${value}%"></div>
      </div>
    `;
  }
}

customElements.define('qbc-progress', QbcProgress);
