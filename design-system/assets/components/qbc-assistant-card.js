// <qbc-assistant-card name="Amara Okafor" role="AI Delivery Assistant"
//                     availability="limited" stats="2 stories · 1 open task">
//   <qbc-tag>Research</qbc-tag>
//   <qbc-button slot="actions">…</qbc-button>
//
// An assistant and their current load. Roles are free text and are never colour-coded,
// so the only status colour on the card is the availability dot. The tag list keeps a
// minimum height so a card with no specialties still lines up with its neighbours in the
// grid.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-avatar.js';
import './qbc-availability.js';

const AVAILABILITY = ['available', 'limited', 'unavailable'];

class QbcAssistantCard extends QbcElement {
  static get observedAttributes() { return ['name', 'role', 'availability', 'stats']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      article {
        padding: 23px;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-xl);
      }

      .assistant-main { display: flex; gap: 14px; align-items: center; }
      h2 { margin: 0; font-size: var(--qbc-fs-lg); }
      p { margin: 2px 0 0; color: var(--qbc-ink-soft); font-size: var(--qbc-fs-xs); }

      /* The reserved height is what keeps a specialty-less assistant from collapsing. */
      .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        min-height: 29px;
        margin: 21px 0;
      }

      .assistant-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 15px;
        border-top: 1px solid var(--qbc-line);
      }
      .stats { display: block; color: var(--qbc-ink-soft); font-size: var(--qbc-fs-2xs); }

      .row-actions { display: flex; gap: 5px; justify-content: flex-end; }
    `;
  }

  template() {
    const name = this.attr('name', 'Unnamed assistant');
    const role = this.attr('role');
    const stats = this.attr('stats');
    const status = AVAILABILITY.includes(this.attr('availability')) ? this.attr('availability') : 'available';
    return `
      <article>
        <div class="assistant-main">
          <qbc-avatar name="${esc(name)}" size="lg"></qbc-avatar>
          <div>
            <h2>${esc(name)}</h2>
            ${role ? `<p>${esc(role)}</p>` : ''}
          </div>
        </div>
        <div class="tag-list"><slot></slot></div>
        <footer class="assistant-foot">
          <div>
            <qbc-availability status="${esc(status)}"></qbc-availability>
            ${stats ? `<small class="stats">${esc(stats)}</small>` : ''}
          </div>
          <div class="row-actions"><slot name="actions"></slot></div>
        </footer>
      </article>
    `;
  }
}

customElements.define('qbc-assistant-card', QbcAssistantCard);
