// <qbc-confirm-dialog open static title="Delete QBC-104?" copy="…" confirm-label="Delete permanently">
//
// The narrow, centred stop-and-think before a destructive action. It names the record
// in the question and the consequence in the copy, and Cancel is always the first thing
// focus lands on.
//
// The scrim, [static] mode, focus trap and Escape handling are deliberately duplicated
// from qbc-dialog rather than inherited. The two share a behaviour but not a structure:
// this one has no slots, owns both of its buttons, and carries a fixed icon, so a
// shared base class would be a seam holding two unrelated templates apart.

import { QbcElement, esc } from './qbc-base.js';

// Both buttons live in this component's shadow root, so the trap collects from there.
const INNER_CONTROL = 'button, a[href], input, select, textarea';

/** The deepest focused node. document.activeElement stops at the outermost shadow host. */
function deepActive() {
  let node = document.activeElement;
  while (node && node.shadowRoot && node.shadowRoot.activeElement) node = node.shadowRoot.activeElement;
  return node;
}

class QbcConfirmDialog extends QbcElement {
  static get observedAttributes() { return ['open', 'static', 'title', 'copy', 'confirm-label']; }

  constructor() {
    super();
    this._onKeydown = this._onKeydown.bind(this);
    this._returnFocus = null;
  }

  connectedCallback() {
    super.connectedCallback();
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

      .scrim {
        position: fixed;
        inset: 0;
        /* iOS Safari lays a fixed box out against the *large* viewport — the page as it
           would be with the browser toolbars retracted — so a sheet centred in a scrim
           that only says inset: 0 sits low enough for its footer to end up behind the
           toolbar. dvh tracks the viewport that is actually visible; the vh line above
           it is the fallback for browsers without dvh. */
        height: 100vh;
        height: 100dvh;
        z-index: calc(var(--qbc-z-toast) - 1);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--qbc-scrim);
        backdrop-filter: blur(2px);
      }

      :host([static]) .scrim {
        position: static;
        height: auto;
        z-index: auto;
        display: block;
        background: none;
        backdrop-filter: none;
      }

      .sheet {
        display: flex;
        overflow: hidden;
        width: min(430px, calc(100vw - 32px));
        max-height: calc(100% - 48px - env(safe-area-inset-bottom, 0px));
        flex-direction: column;
        border-radius: var(--qbc-r-2xl);
        background: var(--qbc-panel);
        box-shadow: var(--qbc-shadow-overlay);
      }

      :host([static]) .sheet {
        width: 100%;
        max-width: min(430px, calc(100vw - 32px));
      }

      /* min-height: 0 undoes the flex default of min-height: auto, which refuses to
         shrink an item below its own content: without it the content pushes the action
         bar past the sheet's max-height and the buttons land off screen. */
      .content {
        overflow-y: auto;
        min-height: 0;
        flex: 0 1 auto;
        padding: 30px 28px 0;
        text-align: center;
        overscroll-behavior: contain;
      }

      .icon {
        display: grid;
        width: 44px;
        height: 44px;
        margin: auto;
        border-radius: var(--qbc-r-round);
        place-items: center;
        color: var(--qbc-danger);
        background: var(--qbc-danger-soft);
        font-weight: var(--qbc-fw-heavy);
      }

      h2 {
        margin: 13px 0 7px;
        font-size: var(--qbc-fs-3xl);
      }

      p {
        margin: 0 0 25px;
        color: var(--qbc-ink-soft);
      }

      /* The mock pulls the action bar out to the sheet edge with a negative margin,
         because it sits inside the padded form. Here it is already a sibling. */
      .actions {
        display: flex;
        flex: none;
        gap: 9px;
        justify-content: flex-end;
        padding: 18px 28px;
        border-top: 1px solid var(--qbc-line);
        background: var(--qbc-surface-raised);
      }

      @media (max-width: 760px) {
        .actions { padding: 16px 20px; }
      }
    `;
  }

  template() {
    const isStatic = this.battr('static');
    const title = this.attr('title', 'Are you sure?');
    const copy = this.attr('copy', '');
    const confirmLabel = this.attr('confirm-label', 'Confirm');
    const role = isStatic ? 'region' : 'dialog';
    const modal = isStatic ? '' : ' aria-modal="true"';
    const describedBy = copy ? ' aria-describedby="qbc-confirm-copy"' : '';
    return `
      <div class="scrim">
        <div class="sheet" role="${role}"${modal} aria-labelledby="qbc-confirm-title"${describedBy} tabindex="-1">
          <div class="content">
            <div class="icon" aria-hidden="true">!</div>
            <h2 id="qbc-confirm-title">${esc(title)}</h2>
            ${copy ? `<p id="qbc-confirm-copy">${esc(copy)}</p>` : ''}
          </div>
          <footer class="actions">
            <qbc-button class="cancel" variant="secondary">Cancel</qbc-button>
            <qbc-button class="confirm" variant="danger">${esc(confirmLabel)}</qbc-button>
          </footer>
        </div>
      </div>
    `;
  }

  afterRender() {
    this.shadowRoot.querySelector('.cancel')
      .addEventListener('click', () => this.close('cancel'));

    this.shadowRoot.querySelector('.confirm').addEventListener('click', () => {
      this.emit('qbc-confirm', { label: this.attr('confirm-label', 'Confirm') });
      this.close('confirm');
    });

    const scrim = this.shadowRoot.querySelector('.scrim');
    scrim.addEventListener('click', event => {
      if (this.battr('static')) return;
      if (event.target === scrim) this.close('backdrop');
    });
  }

  /** Dismiss the dialog. Cancelable, so a consumer can hold it open. */
  close(reason = 'programmatic') {
    const allowed = this.emit('qbc-close', { reason }, { cancelable: true });
    if (allowed) this.removeAttribute('open');
    return allowed;
  }

  // ---- Focus management -------------------------------------------------------

  /**
   * Cancel then Confirm, in tab order. Both are <qbc-button> wrappers whose real
   * <button> sits inside their own shadow root, so each is mapped through it; the
   * fallback to the wrapper covers the frame before qbc-button has upgraded.
   */
  _focusable() {
    return [...this.shadowRoot.querySelectorAll('qbc-button')]
      .map(node => node.shadowRoot?.querySelector(INNER_CONTROL) ?? node)
      .filter(node => node && !node.hasAttribute('disabled'));
  }

  /** Remember where focus came from, then land it on Cancel — never on the destructive action. */
  _trapOn() {
    this._returnFocus = deepActive();
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

customElements.define('qbc-confirm-dialog', QbcConfirmDialog);
