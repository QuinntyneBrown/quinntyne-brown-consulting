// <qbc-nav-item icon="board" label="Board" href="#board" active>
//
// One destination in the sidebar rail. Three states, all expressed in CSS: idle,
// hover, and current. The current route is identified by fill as well as by text,
// and carries aria-current="page" so it is announced, not merely coloured.

import { QbcElement, esc } from './qbc-base.js';

class QbcNavItem extends QbcElement {
  static get observedAttributes() { return ['icon', 'label', 'href', 'active']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      a {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 11px 13px;
        border-radius: var(--qbc-r-control);
        color: var(--qbc-nav-ink);
        font-weight: var(--qbc-fw-nav);
        text-decoration: none;
      }

      /* The 18px centred box is the icon sizing contract for the whole rail: every
         label starts at the same x regardless of how wide the glyph renders. */
      qbc-icon {
        width: 18px;
        color: var(--qbc-nav-icon);
        text-align: center;
      }

      a:hover { color: var(--qbc-ink); background: var(--qbc-soft); }

      :host([active]) a { color: var(--qbc-accent-dark); background: var(--qbc-accent-soft); }
      /* The mock's glyph colour is set on the span itself and so survives the active
         state. Keeping it constant is deliberate, not an oversight. */
    `;
  }

  template() {
    // The manifest default for href is empty. An <a> with no href is not focusable,
    // so an unset link renders as "#": the item stays keyboard reachable in the docs.
    const href = this.attr('href') || '#';
    const icon = this.attr('icon', 'board');
    const label = this.attr('label', 'Destination');
    const current = this.battr('active') ? ' aria-current="page"' : '';
    return `
      <a href="${esc(href)}"${current}>
        <qbc-icon name="${esc(icon)}" size="15"></qbc-icon>
        <span>${esc(label)}</span>
      </a>
    `;
  }
}

customElements.define('qbc-nav-item', QbcNavItem);
