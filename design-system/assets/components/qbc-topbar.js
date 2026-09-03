// <qbc-topbar breadcrumb="Workspace / Board" menu-label="Open navigation" nav-open>
//
// The workspace header: a drawer toggle that only exists on small screens, the current
// location, and the one global action for the page. The toggle reports drawer state
// through aria-expanded but does not own it — it asks the shell to change it.

import { QbcElement, esc } from './qbc-base.js';

class QbcTopbar extends QbcElement {
  static get observedAttributes() { return ['breadcrumb', 'menu-label', 'nav-open']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      header {
        display: flex;
        height: var(--qbc-topbar-h);
        align-items: center;
        justify-content: space-between;
        padding: 0 var(--qbc-gutter);
        border-bottom: 1px solid var(--qbc-line);
      }

      .breadcrumb {
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-sm);
        font-weight: var(--qbc-fw-medium);
      }

      /* The user-agent padding is left in place: it is what the mock renders, and on a
         touch target this small every pixel of it is worth keeping. */
      .menu {
        display: none;
        border: 0;
        background: none;
        font-size: 20px;
      }

      .actions {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      /* The mock also shortens the bar and tightens the gutter here; tokens.css
         already retunes --qbc-topbar-h and --qbc-gutter at this breakpoint, and
         those custom properties inherit through the shadow boundary. */
      @media (max-width: 760px) {
        .menu { display: block; }
        .breadcrumb { display: none; }
      }
    `;
  }

  template() {
    const breadcrumb = this.attr('breadcrumb', 'Workspace / Board');
    const menuLabel = this.attr('menu-label', 'Open navigation');
    const expanded = this.battr('nav-open') ? 'true' : 'false';
    return `
      <header>
        <button class="menu" type="button" aria-label="${esc(menuLabel)}" aria-expanded="${expanded}">
          <qbc-icon name="menu" size="20"></qbc-icon>
        </button>
        <div class="breadcrumb">${esc(breadcrumb)}</div>
        <div class="actions"><slot></slot></div>
      </header>
    `;
  }

  afterRender() {
    this.shadowRoot.querySelector('.menu')
      .addEventListener('click', () => this.emit('qbc-menu-toggle', { open: !this.battr('nav-open') }));
  }
}

customElements.define('qbc-topbar', QbcTopbar);
