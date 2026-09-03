// <qbc-points value="5">
//
// The story estimate. It sits in a squircle at the small radius, deliberately a
// different shape from the capsule <qbc-count>, so a glance at a card foot tells an
// estimate apart from a quantity without reading either number.
//
// An unestimated story shows an em dash rather than a zero or an empty box, because
// "not estimated yet" and "estimated at zero" are different facts about the work.

import { QbcElement, esc } from './qbc-base.js';

class QbcPoints extends QbcElement {
  static get observedAttributes() { return ['value']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: inline-block; }

      .points {
        display: inline-grid;
        min-width: 27px;
        height: 27px;
        padding: 0 6px;
        place-items: center;
        border-radius: var(--qbc-r-xs);
        color: var(--qbc-ink-soft);
        background: var(--qbc-soft);
        font-size: var(--qbc-fs-2xs);
        font-weight: var(--qbc-fw-bold);
      }
    `;
  }

  template() {
    const value = this.attr('value', '').trim();
    // The dash is decorative on its own, so the chip names what it stands for.
    const label = value ? `${value} story points` : 'Not estimated';
    return `
      <span class="points" role="img" title="${esc(label)}" aria-label="${esc(label)}">${value ? esc(value) : '—'}</span>
    `;
  }
}

customElements.define('qbc-points', QbcPoints);
