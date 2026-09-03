// <qbc-empty-state icon="empty" title="Nothing here yet" subtitle="" bare>
//
// The productive empty view. Every empty region in the product states what is missing
// and offers the one action that fixes it, so the default slot is the next action
// rather than decoration. `bare` is the mock's `.board-column .empty-state` override,
// promoted to an attribute because a board column is not the only place that wants an
// empty state without a dashed box competing with the column's own surface.

// qbc-icon is rendered inside this component's shadow root, so the registration is a
// hard dependency rather than something the host page happens to have loaded first.
import './qbc-icon.js';
import { QbcElement, esc } from './qbc-base.js';

class QbcEmptyState extends QbcElement {
  static get observedAttributes() { return ['icon', 'title', 'subtitle', 'bare']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: block;
        padding: 64px 28px;
        border: 1px dashed var(--qbc-line-dashed);
        border-radius: var(--qbc-r-xl);
        text-align: center;
      }
      :host([bare]) { padding: 35px 12px; border: 0; }

      .empty-icon {
        display: grid;
        width: 46px;
        height: 46px;
        margin: 0 auto 16px;
        border-radius: var(--qbc-r-tile);
        place-items: center;
        color: var(--qbc-accent);
        background: var(--qbc-accent-soft);
      }

      h2 { margin: 0; font-size: var(--qbc-fs-2xl); }
      p { margin: 7px auto 19px; color: var(--qbc-ink-soft); }

      /* The mock always ships copy, so the 19px gap above the action lives on the
         paragraph. Carry it on the heading when the subtitle is omitted. */
      h2.no-subtitle { margin-bottom: 19px; }
    `;
  }

  template() {
    const subtitle = this.attr('subtitle');
    return `
      <div class="empty-icon">
        <qbc-icon name="${esc(this.attr('icon', 'empty'))}"></qbc-icon>
      </div>
      <h2 class="${subtitle ? '' : 'no-subtitle'}">${esc(this.attr('title', 'Nothing here yet'))}</h2>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
      <slot></slot>
    `;
  }
}

customElements.define('qbc-empty-state', QbcEmptyState);
