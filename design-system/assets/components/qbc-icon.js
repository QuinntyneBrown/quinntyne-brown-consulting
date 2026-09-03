// <qbc-icon name="board" size="18" label="">
//
// The workspace icon set. Every mark is a literal Unicode glyph, exactly as the mocks
// draw them, but routed through one registry so the sizing contract lives in a single
// place and a future move to inline SVG is a change to this file alone.
//
// Caveat worth knowing: these glyphs are supplied by whichever font resolves from the
// stack, so they render differently across platforms. The command mark and the board
// mark vary the most. The 18px box below is the contract to preserve if the set is
// ever redrawn.

import { QbcElement, esc } from './qbc-base.js';

export const GLYPHS = {
  board: '▦',          // ▦
  backlog: '≡',        // ≡
  initiatives: '⌘',    // ⌘
  assistants: '◎',     // ◎
  menu: '☰',           // ☰
  add: '＋',            // ＋ fullwidth, so it optically matches the label
  close: '×',          // ×
  search: '⌕',         // ⌕
  'arrow-left': '←',   // ←
  'arrow-right': '→',  // →
  more: '•••', // •••
  alert: '!',
  empty: '◇',          // ◇
  initiative: '↗',     // ↗
};

class QbcIcon extends QbcElement {
  static get observedAttributes() { return ['name', 'size', 'label']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: inline-grid;
        place-items: center;
        width: var(--icon-box, 18px);
        line-height: 1;
        text-align: center;
      }
      span { display: block; }
    `;
  }

  template() {
    const glyph = GLYPHS[this.attr('name', 'board')] ?? GLYPHS.board;
    const size = this.attr('size', '16');
    const label = this.attr('label', '');
    const box = Math.max(Number(size) || 16, 18);
    return `<span style="font-size:${esc(size)}px;--icon-box:${box}px"
      ${label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"'}>${glyph}</span>`;
  }

  afterRender() {
    // The host owns the box so callers can size icons without wrapper elements.
    const size = Number(this.attr('size', '16')) || 16;
    this.style.setProperty('--icon-box', `${Math.max(size, 18)}px`);
  }
}

customElements.define('qbc-icon', QbcIcon);
