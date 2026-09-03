// <qbc-sprint-row name="Sprint 14" status="active" meta="Aug 31 – Sep 13 · goal">
//   <qbc-button slot="actions">Complete</qbc-button>
//
// One sprint in the sprint manager. The row carries no lifecycle logic: which actions are
// legal for a given status is the caller's decision, and only the valid ones are slotted
// in, so the row never renders a disabled control the reader has to interpret.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-pill.js';

const STATUSES = ['planned', 'active', 'completed'];

class QbcSprintRow extends QbcElement {
  static get observedAttributes() { return ['name', 'status', 'meta']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      article {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 18px;
        align-items: center;
        padding: 16px;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-md);
      }

      /* h3 because this row lives inside the sprint manager dialog, under its h2. */
      h3 { margin: 0 0 4px; font-size: var(--qbc-fs-md); }
      p { margin: 0; color: var(--qbc-ink-soft); font-size: var(--qbc-fs-2xs); }

      .sprint-row-actions { display: flex; gap: 6px; }

      @media (max-width: 760px) {
        article { grid-template-columns: 1fr; }
      }
    `;
  }

  template() {
    const status = STATUSES.includes(this.attr('status')) ? this.attr('status') : 'planned';
    const meta = this.attr('meta');
    return `
      <article>
        <div>
          <h3>${esc(this.attr('name', 'Sprint'))} <qbc-pill tone="${esc(status)}">${esc(status)}</qbc-pill></h3>
          ${meta ? `<p>${esc(meta)}</p>` : ''}
        </div>
        <div class="sprint-row-actions"><slot name="actions"></slot></div>
      </article>
    `;
  }
}

customElements.define('qbc-sprint-row', QbcSprintRow);
