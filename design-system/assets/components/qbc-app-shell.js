// <qbc-app-shell nav-open>
//
// The workspace frame: skip link, fixed sidebar, top bar, and the routed content
// region. It owns exactly one piece of state — whether the mobile drawer is open —
// and publishes the two ways a user asks for it to close.

import { QbcElement } from './qbc-base.js';

class QbcAppShell extends QbcElement {
  static get observedAttributes() { return ['nav-open']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; min-height: 100vh; }

      .skip-link {
        position: fixed;
        top: 12px;
        left: 12px;
        z-index: var(--qbc-z-skip);
        padding: 10px 14px;
        transform: translateY(-150%);
        border-radius: var(--qbc-r-sm);
        color: #fff;
        background: var(--qbc-ink);
      }
      /* :focus, not :focus-visible — the link must appear for the keyboard user who
         tabbed to it, and it is unreachable by pointer. */
      .skip-link:focus { transform: none; }

      /* Addition to the mock. The mock slides the drawer over the page with nothing
         behind it, so a tap outside the drawer falls through to the content underneath
         and there is no way to dismiss it by pointer. This scrim sits one layer below
         the sidebar, exists only while the drawer is open below 760px, and is a real
         button so it is announced and operable rather than a decorative overlay. */
      .scrim {
        position: fixed;
        inset: 0;
        z-index: calc(var(--qbc-z-sidebar) - 1);
        display: none;
        padding: 0;
        border: 0;
        background: var(--qbc-scrim);
      }

      .workspace {
        min-height: 100vh;
        margin-left: var(--qbc-sidebar-w);
        min-width: 0;
      }

      main {
        display: block;
        padding: 54px var(--qbc-gutter) 80px;
      }

      .page {
        max-width: var(--qbc-page-max);
        min-width: 0;
        margin: 0 auto;
        animation: enter var(--qbc-dur-fast) var(--qbc-ease);
      }
      /* The reduced-motion retune in tokens.css collapses --qbc-dur-fast to 1ms, so
         this animation neutralises itself without a second media query. */
      @keyframes enter { from { opacity: 0; transform: translateY(4px); } }

      @media (max-width: 760px) {
        :host([nav-open]) .scrim { display: block; }
        .workspace {
          width: 100%;
          margin-left: 0;
          overflow-x: hidden;
        }
        main { padding: 35px 18px 65px; }
      }
    `;
  }

  template() {
    return `
      <a class="skip-link" href="#main-content">Skip to content</a>
      <slot name="sidebar"></slot>
      <button class="scrim" type="button" aria-label="Close navigation"></button>
      <div class="workspace">
        <slot name="topbar"></slot>
        <main id="main-content" tabindex="-1">
          <div class="page"><slot></slot></div>
        </main>
      </div>
    `;
  }

  afterRender() {
    const main = this.shadowRoot.querySelector('main');

    // A fragment href cannot cross the shadow boundary, so the link moves focus itself.
    this.shadowRoot.querySelector('.skip-link').addEventListener('click', event => {
      event.preventDefault();
      main.focus();
    });

    this.shadowRoot.querySelector('.scrim')
      .addEventListener('click', () => this.emit('qbc-dismiss-nav'));
  }
}

customElements.define('qbc-app-shell', QbcAppShell);
