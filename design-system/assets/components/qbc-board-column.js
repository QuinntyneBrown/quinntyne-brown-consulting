// <qbc-board-column label="In progress" count="4" drag-over>
//
// One workflow state on the sprint board. Columns are never colour-coded: position and
// heading carry the meaning, and the single accent moment is the drop highlight, which is
// the strongest use of the accent anywhere in the system.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-count.js';

// Several columns exist on a page and each labels its own heading, so ids are minted from
// a module counter rather than derived from the label, which is not guaranteed unique.
let columnCount = 0;

class QbcBoardColumn extends QbcElement {
  static get observedAttributes() { return ['label', 'count', 'drag-over']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  constructor() {
    super();
    this._headingId = `qbc-board-column-${++columnCount}`;
  }

  styles() {
    return `
      :host { display: block; }

      section {
        min-height: 460px;
        padding: 18px;
        border-radius: var(--qbc-r-xl);
        background: var(--qbc-soft);
      }
      :host([drag-over]) section {
        box-shadow: inset 0 0 0 2px var(--qbc-accent);
        background: var(--qbc-accent-soft);
      }

      .column-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 2px 16px;
      }
      h2 { margin: 0; font-size: var(--qbc-fs-md); }

      .card-stack { display: grid; gap: 11px; }

      /* Below the wide breakpoint the board stacks to one column, so the tall empty
         column that reads as an invitation on desktop becomes dead scroll. */
      @media (max-width: 1000px) {
        section { min-height: 220px; }
      }
    `;
  }

  template() {
    const id = this._headingId;
    return `
      <section aria-labelledby="${esc(id)}">
        <header class="column-head">
          <h2 id="${esc(id)}">${esc(this.attr('label', 'To do'))}</h2>
          <qbc-count value="${esc(this.attr('count', '0'))}"></qbc-count>
        </header>
        <div class="card-stack"><slot></slot></div>
      </section>
    `;
  }
}

customElements.define('qbc-board-column', QbcBoardColumn);
