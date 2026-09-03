// <qbc-epic-row title="…" summary="A calm status surface · 4 stories" progress="50">
//   <qbc-button slot="actions">…</qbc-button>
//
// One epic inside an initiative. The completion meter is the only quantity on the row and
// it is the first thing dropped on a phone, where the row has no width to spare and the
// summary already carries the story count in words.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-progress.js';

class QbcEpicRow extends QbcElement {
  static get observedAttributes() { return ['title', 'summary', 'progress']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      .epic-row {
        display: grid;
        grid-template-columns: minmax(180px, 1fr) auto auto;
        gap: 16px;
        align-items: center;
        padding: 16px 0;
        border-top: 1px solid var(--qbc-line);
      }

      strong { display: block; }
      small { color: var(--qbc-ink-soft); }

      .hierarchy-actions { display: flex; gap: 6px; }

      @media (max-width: 760px) {
        .epic-row { grid-template-columns: 1fr auto; }
        qbc-progress { display: none; }
      }
    `;
  }

  template() {
    const summary = this.attr('summary');
    const progress = Number(this.attr('progress', '0')) || 0;
    return `
      <div class="epic-row">
        <div>
          <strong>${esc(this.attr('title', 'Untitled epic'))}</strong>
          ${summary ? `<small>${esc(summary)}</small>` : ''}
        </div>
        <qbc-progress mini value="${progress}" label="${progress}% complete"></qbc-progress>
        <div class="hierarchy-actions"><slot name="actions"></slot></div>
      </div>
    `;
  }
}

customElements.define('qbc-epic-row', QbcEpicRow);
