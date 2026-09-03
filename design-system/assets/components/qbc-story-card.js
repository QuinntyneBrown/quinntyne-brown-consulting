// <qbc-story-card story-key="QBC-101" title="…" context="…" points="5" owner="Maya Chen"
//                 draggable-card dragging>
//
// The board unit of work. It deliberately carries no status pill: the column a card sits
// in is its status, so repeating it on the card would be redundant chrome. Movement and
// edit controls are slotted rather than built in, because only the board knows what
// "forward" and "backward" mean for a given workflow.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-points.js';
import './qbc-avatar.js';

class QbcStoryCard extends QbcElement {
  static get observedAttributes() {
    return ['story-key', 'title', 'context', 'points', 'owner', 'draggable-card', 'dragging'];
  }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      article {
        padding: 18px;
        border: 1px solid var(--qbc-line-card);
        border-radius: var(--qbc-r-lg);
        background: var(--qbc-panel);
        box-shadow: var(--qbc-shadow-card);
      }
      /* The mock keys the grab cursor off draggable="true"; the attribute is renamed here
         so it cannot be confused with the native draggable attribute on the host. */
      :host([draggable-card]) article { cursor: grab; }
      :host([dragging]) article { opacity: .5; }

      .card-top {
        display: flex;
        gap: var(--qbc-s-2);
        align-items: center;
        justify-content: space-between;
      }
      .story-key {
        color: var(--qbc-ink-faint);
        font-size: var(--qbc-fs-2xs);
        font-weight: var(--qbc-fw-bold);
        letter-spacing: var(--qbc-tracking-key);
      }

      h3 {
        margin: 14px 0 8px;
        font-size: var(--qbc-fs-base);
        line-height: var(--qbc-lh-snug);
      }

      /* One line only. A story title that needs its context spelled out belongs in the
         backlog row, which has room for it. */
      .card-context {
        overflow: hidden;
        margin: 0;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-xs);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 18px;
      }
      .card-actions { display: flex; gap: 5px; }
    `;
  }

  template() {
    const owner = this.attr('owner');
    const context = this.attr('context');
    return `
      <article>
        <div class="card-top">
          <span class="story-key">${esc(this.attr('story-key', 'QBC-000'))}</span>
          <qbc-points value="${esc(this.attr('points'))}"></qbc-points>
        </div>
        <h3>${esc(this.attr('title', 'Untitled story'))}</h3>
        ${context ? `<p class="card-context">${esc(context)}</p>` : ''}
        <footer class="card-foot">
          ${owner
            ? `<qbc-avatar name="${esc(owner)}"></qbc-avatar>`
            : '<qbc-avatar unassigned></qbc-avatar>'}
          <div class="card-actions"><slot name="actions"></slot></div>
        </footer>
      </article>
    `;
  }
}

customElements.define('qbc-story-card', QbcStoryCard);
