// <qbc-data-row story-key="QBC-101" title="…" context="…">
//   <qbc-pill slot="state">…</qbc-pill>
//   <qbc-points slot="points"></qbc-points>
//   <qbc-select slot="sprint"></qbc-select>
//   <qbc-button slot="actions">…</qbc-button>
//
// The backlog row. It is a grid rather than a table row, which is what lets each cell
// become a labelled block on a phone instead of forcing a horizontal scroll. The cell
// labels are always in the markup and hidden on wide screens, so the column heading a
// cell belongs to is never lost when the header row is out of view.

import { QbcElement, esc } from './qbc-base.js';

class QbcDataRow extends QbcElement {
  static get observedAttributes() { return ['story-key', 'title', 'context']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      article {
        display: grid;
        grid-template-columns:
          minmax(280px, 2fr) minmax(160px, 1fr) 100px 118px minmax(120px, auto);
        gap: 20px;
        align-items: center;
        min-height: 84px;
        padding: 16px 20px;
        border-bottom: 1px solid var(--qbc-line);
      }
      :host(:last-of-type) article { border-bottom: 0; }
      article:hover { background: var(--qbc-surface-hover); }

      .row-title { display: flex; gap: 12px; align-items: flex-start; }
      .story-key {
        color: var(--qbc-ink-faint);
        font-size: var(--qbc-fs-2xs);
        font-weight: var(--qbc-fw-bold);
        letter-spacing: var(--qbc-tracking-key);
      }
      strong { display: block; }
      .row-title small, .cell-label {
        display: block;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
      /* Present for every cell, revealed only when the row reflows into a card. */
      .cell-label { display: none; margin-bottom: 2px; }

      .row-actions { display: flex; gap: 5px; justify-content: flex-end; }

      /* The estimate is the first thing to go: it is the cell a reader can most easily
         reconstruct from the story itself. */
      @media (max-width: 1000px) {
        article { grid-template-columns: minmax(250px, 1.7fr) 1fr 100px auto; }
        .cell-points { display: none; }
      }

      /* Two columns, with the title and the actions spanning both. The estimate returns
         because the card has the room the four-column grid did not. */
      @media (max-width: 760px) {
        article {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          margin-bottom: 10px;
          padding: 17px;
          border: 1px solid var(--qbc-line);
          border-radius: var(--qbc-r-lg);
        }
        .row-title, .row-actions { grid-column: 1 / -1; }
        .cell-points { display: block; }
        .cell-label { display: block; }
        .row-actions { justify-content: flex-start; }

        /* Each row is a self-contained card here, so the last one keeps all four
           sides. The desktop rule that strips the divider from the final row would
           otherwise leave one card open at the bottom. */
        :host(:last-of-type) article { border-bottom: 1px solid var(--qbc-line); }
      }
    `;
  }

  template() {
    const context = this.attr('context');
    return `
      <article>
        <div class="row-title">
          <span class="story-key">${esc(this.attr('story-key', 'QBC-000'))}</span>
          <div>
            <strong>${esc(this.attr('title', 'Untitled story'))}</strong>
            ${context ? `<small>${esc(context)}</small>` : ''}
          </div>
        </div>
        <div class="cell-state">
          <span class="cell-label">State</span>
          <slot name="state"></slot>
        </div>
        <div class="cell-points">
          <span class="cell-label">Estimate</span>
          <slot name="points"></slot>
        </div>
        <div class="cell-sprint">
          <span class="cell-label">Sprint</span>
          <slot name="sprint"></slot>
        </div>
        <div class="row-actions"><slot name="actions"></slot></div>
      </article>
    `;
  }
}

customElements.define('qbc-data-row', QbcDataRow);
