// <qbc-sidebar open footer="Quinntyne Brown Consulting Inc.">
//
// The 224px navigation rail. It is fixed at every width; below 760px it becomes an
// off-canvas drawer that slides in when [open] is set. The shell owns that state and
// the scrim that dismisses it, so this component stays a pure presentation of it.

import { QbcElement, esc } from './qbc-base.js';

class QbcSidebar extends QbcElement {
  static get observedAttributes() { return ['open', 'footer']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      /* The mock's single .sidebar rule is split in two: the host owns the fixed frame
         so the drawer transform and shadow apply to the whole rail, and the inner
         <aside> carries the landmark semantics and the padding. */
      :host {
        position: fixed;
        inset: 0 auto 0 0;
        z-index: var(--qbc-z-sidebar);
        display: flex;
        width: var(--qbc-sidebar-w);
        flex-direction: column;
        border-right: 1px solid var(--qbc-line);
        background: var(--qbc-surface-raised);
      }

      aside {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-height: 0;
        padding: 30px 22px 24px;
      }

      .brand { margin: 0 8px 42px; }

      /* Slotted nav items become grid items of this <nav>, because a <slot> is
         display: contents and so contributes no box of its own. */
      nav {
        display: grid;
        gap: 6px;
      }

      .foot {
        margin-top: auto;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
      .foot p { margin: 22px 8px 0; }

      @media (max-width: 760px) {
        :host {
          transform: translateX(-100%);
          box-shadow: var(--qbc-shadow-overlay);
          transition: transform var(--qbc-dur-base) ease;
        }
        :host([open]) { transform: none; }
      }
    `;
  }

  template() {
    const footer = this.attr('footer', 'Quinntyne Brown Consulting Inc.');
    // A real <aside> gives the rail the mock's complementary landmark, named by
    // aria-label; the inner <nav> is the navigation landmark within it.
    return `
      <aside aria-label="Main navigation">
        <div class="brand">
          <slot name="brand"><qbc-brand href="#board"></qbc-brand></slot>
        </div>
        <nav><slot></slot></nav>
        <div class="foot"><p>${esc(footer)}</p></div>
      </aside>
    `;
  }
}

customElements.define('qbc-sidebar', QbcSidebar);
