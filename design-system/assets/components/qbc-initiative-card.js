// <qbc-initiative-card title="…" description="…" summary="2 epics · 7 stories">
//   <qbc-epic-row …></qbc-epic-row>
//   <qbc-button slot="actions">…</qbc-button>
//
// An initiative and the epics beneath it. Hierarchy is expressed by a 58px indent on the
// epic list, not by a disclosure widget: the whole tree is always visible, because the
// point of the view is to see how today's work ladders up. The accent tile reuses the
// brand-mark treatment, which is the only other place a solid accent square appears.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-icon.js';
import './qbc-pill.js';

class QbcInitiativeCard extends QbcElement {
  static get observedAttributes() { return ['title', 'description', 'summary']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      article {
        overflow: hidden;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-xl);
      }

      .initiative-head {
        display: flex;
        gap: 22px;
        align-items: flex-start;
        justify-content: space-between;
        padding: 23px 25px;
        background: var(--qbc-surface-raised);
      }
      .initiative-title { display: flex; gap: 14px; align-items: flex-start; }

      /* The brand-mark treatment, reused. flex: none keeps it square when the title wraps. */
      .initiative-mark {
        display: grid;
        width: 38px;
        height: 38px;
        flex: none;
        border-radius: var(--qbc-r-md);
        place-items: center;
        color: var(--qbc-panel);
        background: var(--qbc-accent);
        font-size: var(--qbc-fs-2xl);
        font-weight: var(--qbc-fw-bold);
      }

      h2 { margin: 0 0 4px; font-size: var(--qbc-fs-xl); }
      p { margin: 0; color: var(--qbc-ink-soft); font-size: var(--qbc-fs-sm); }

      /* align-items is deliberate. The mock omits it, so its roll-up pill stretches to
         the height of the tallest slotted button instead of keeping its own shape. */
      .hierarchy-actions { display: flex; gap: 6px; align-items: center; }

      /* 58px is the hierarchy. Epics sit clear of the initiative title, not under it. */
      .epic-list { padding: 5px 25px 18px 58px; }

      @media (max-width: 760px) {
        .initiative-head { align-items: stretch; flex-direction: column; }
        .epic-list { padding-left: 25px; }
      }
    `;
  }

  template() {
    const description = this.attr('description');
    const summary = this.attr('summary');
    return `
      <article>
        <header class="initiative-head">
          <div class="initiative-title">
            <span class="initiative-mark" aria-hidden="true">
              <qbc-icon name="initiative" size="18"></qbc-icon>
            </span>
            <div>
              <h2>${esc(this.attr('title', 'Untitled initiative'))}</h2>
              ${description ? `<p>${esc(description)}</p>` : ''}
            </div>
          </div>
          <div class="hierarchy-actions">
            ${summary ? `<qbc-pill tone="muted">${esc(summary)}</qbc-pill>` : ''}
            <slot name="actions"></slot>
          </div>
        </header>
        <div class="epic-list"><slot></slot></div>
      </article>
    `;
  }
}

customElements.define('qbc-initiative-card', QbcInitiativeCard);
