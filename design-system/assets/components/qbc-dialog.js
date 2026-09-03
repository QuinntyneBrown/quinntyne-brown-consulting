// <qbc-dialog open static title="New story" subtitle="…" size="md|sm">
//
// The modal task surface: sticky header, scrolling body, tinted action footer.
//
// The mock uses a native <dialog>, which buys focus trapping and the top layer for
// free. A custom element inherits neither, so both are rebuilt here — see the focus
// management block at the bottom. What it buys back is [static], which renders the
// same element inline with no scrim and no trapping, so the documentation site can
// show a real dialog in the flow of the page and launch the identical element modally.
//
// Note on the title attribute: it is the manifest's public API for the heading, and it
// is also the native tooltip attribute, so a browser will show the heading text on
// hover over the host. The manifest is authoritative, so the collision is accepted.

import { QbcElement, esc } from './qbc-base.js';

// The light-DOM candidate list. Design-system controls are named as elements because
// their real focusable node lives inside their own shadow root.
const FOCUSABLE = 'qbc-button, qbc-icon-button, button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
const INNER_CONTROL = 'button, a[href], input, select, textarea';

/** The deepest focused node. document.activeElement stops at the outermost shadow host. */
function deepActive() {
  let node = document.activeElement;
  while (node && node.shadowRoot && node.shadowRoot.activeElement) node = node.shadowRoot.activeElement;
  return node;
}

class QbcDialog extends QbcElement {
  static get observedAttributes() { return ['open', 'static', 'title', 'subtitle', 'size']; }

  constructor() {
    super();
    this._onKeydown = this._onKeydown.bind(this);
    this._returnFocus = null;
  }

  connectedCallback() {
    super.connectedCallback();
    // Capture phase, on the document: the dialog must see Escape and Tab before any
    // control inside it does, including controls sitting in other shadow roots.
    document.addEventListener('keydown', this._onKeydown, true);
    if (this.battr('open') && !this.battr('static')) this._trapOn();
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this._onKeydown, true);
    this._returnFocus = null;
  }

  attributeChangedCallback(name, prev, next) {
    if (!this._rendered) return;
    this.render();
    if (name !== 'open' || this.battr('static')) return;
    if (next !== null && prev === null) this._trapOn();
    if (next === null && prev !== null) this._trapOff();
  }

  styles() {
    return `
      :host { display: none; }
      :host([open]) { display: block; }

      /* The mock's ::backdrop, rebuilt. The z-index sits just under the toast layer so
         a toast raised from inside the dialog is still visible above it. */
      .scrim {
        position: fixed;
        inset: 0;
        z-index: calc(var(--qbc-z-toast) - 1);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--qbc-scrim);
        backdrop-filter: blur(2px);
      }

      :host([static]) .scrim {
        position: static;
        z-index: auto;
        display: block;
        background: none;
        backdrop-filter: none;
      }

      /* overflow: hidden is an addition. The mock's footer fill spills past the 16px
         corners, because a rounded box does not clip a descendant's background. */
      .sheet {
        display: flex;
        overflow: hidden;
        width: min(680px, calc(100vw - 32px));
        max-height: calc(100vh - 48px);
        flex-direction: column;
        border-radius: var(--qbc-r-2xl);
        background: var(--qbc-panel);
        box-shadow: var(--qbc-shadow-overlay);
      }

      :host([size="sm"]) .sheet { width: min(430px, calc(100vw - 32px)); }

      /* Inline, the sheet has to fit whatever column documents it. */
      :host([static]) .sheet {
        width: 100%;
        max-width: min(680px, calc(100vw - 32px));
      }
      :host([static][size="sm"]) .sheet { max-width: min(430px, calc(100vw - 32px)); }

      .head {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        justify-content: space-between;
        padding: 25px 28px 21px;
        border-bottom: 1px solid var(--qbc-line);
      }
      .head h2 {
        margin: 0;
        font-size: var(--qbc-fs-3xl);
        letter-spacing: var(--qbc-tracking-heading);
      }
      .head p {
        margin: 4px 0 0;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-xs);
      }

      .body {
        overflow-y: auto;
        padding: 25px 28px 28px;
      }

      .actions {
        display: flex;
        gap: 9px;
        justify-content: flex-end;
        padding: 18px 28px;
        border-top: 1px solid var(--qbc-line);
        background: var(--qbc-surface-raised);
      }

      @media (max-width: 760px) {
        .head { padding: 22px 20px 18px; }
        .body { padding: 22px 20px; }
        .actions { padding: 16px 20px; }
      }
    `;
  }

  template() {
    const isStatic = this.battr('static');
    const title = this.attr('title', 'Dialog');
    const subtitle = this.attr('subtitle', '');
    // Documented inline, the sheet is a region of the page rather than a modal: no
    // aria-modal, because nothing behind it is actually inert.
    const role = isStatic ? 'region' : 'dialog';
    const modal = isStatic ? '' : ' aria-modal="true"';
    return `
      <div class="scrim">
        <div class="sheet" role="${role}"${modal} aria-labelledby="qbc-dialog-title" tabindex="-1">
          <header class="head">
            <div>
              <h2 id="qbc-dialog-title">${esc(title)}</h2>
              ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
            </div>
            <qbc-icon-button class="close" icon="close" label="Close dialog" variant="bare"></qbc-icon-button>
          </header>
          <div class="body"><slot></slot></div>
          <footer class="actions"><slot name="actions"></slot></footer>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.shadowRoot.querySelector('.close')
      .addEventListener('click', () => this.close('close'));

    const scrim = this.shadowRoot.querySelector('.scrim');
    scrim.addEventListener('click', event => {
      if (this.battr('static')) return;
      if (event.target === scrim) this.close('backdrop');
    });
  }

  /**
   * Dismiss the dialog. The event is cancelable, so a consumer holding unsaved work can
   * preventDefault() and the dialog stays open.
   */
  close(reason = 'programmatic') {
    const allowed = this.emit('qbc-close', { reason }, { cancelable: true });
    if (allowed) this.removeAttribute('open');
    return allowed;
  }

  // ---- Focus management -------------------------------------------------------
  //
  // Everything below exists because a custom element is not a native <dialog>.

  /**
   * The dialog's focusable nodes, in tab order.
   *
   * Slotted design-system controls host their real <button> or <input> inside their own
   * shadow root, so querySelectorAll finds the wrapper and stops there. Each candidate
   * is therefore mapped through its shadow root to the node that actually takes focus,
   * falling back to itself for plain HTML. The internal close button is prepended
   * because it lives in this component's shadow root, where no light-DOM query reaches.
   */
  _focusable() {
    const closeHost = this.shadowRoot.querySelector('.close');
    const close = closeHost ? (closeHost.shadowRoot?.querySelector(INNER_CONTROL) ?? closeHost) : null;
    const slotted = [...this.querySelectorAll(FOCUSABLE)]
      .map(node => node.shadowRoot?.querySelector(INNER_CONTROL) ?? node);
    return [...new Set(close ? [close, ...slotted] : slotted)]
      .filter(node => node && !node.hasAttribute('disabled'));
  }

  /** Remember where focus came from, then move it into the dialog. */
  _trapOn() {
    this._returnFocus = deepActive();
    // One frame, so the freshly rendered tree exists and slotted controls have upgraded.
    requestAnimationFrame(() => {
      if (!this.battr('open') || this.battr('static')) return;
      const items = this._focusable();
      (items[0] ?? this.shadowRoot.querySelector('.sheet'))?.focus();
    });
  }

  /** Put focus back exactly where it was when the dialog opened. */
  _trapOff() {
    const target = this._returnFocus;
    this._returnFocus = null;
    if (target && target.isConnected && typeof target.focus === 'function') target.focus();
  }

  _onKeydown(event) {
    if (!this.battr('open') || this.battr('static')) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close('escape');
      return;
    }
    if (event.key !== 'Tab') return;

    const items = this._focusable();
    if (!items.length) {
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    // deepActive(), not document.activeElement: when a slotted qbc-button holds focus,
    // document.activeElement is the wrapper and would never match either boundary.
    const active = deepActive();
    const outside = !items.includes(active);

    if (event.shiftKey && (active === first || outside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || outside)) {
      event.preventDefault();
      first.focus();
    }
  }
}

customElements.define('qbc-dialog', QbcDialog);
