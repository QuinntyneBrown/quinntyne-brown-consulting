// QBC Workboard — shared base class for shadow-DOM components.
//
// Contract for subclasses:
//   styles()      -> CSS string, prefixed automatically with QBC_SHARED_CSS
//   template()    -> HTML string
//   afterRender() -> optional, re-bind listeners (render() replaces the whole tree)
//
// Attributes are the public API. There are no property accessors and no reflection:
// variants are expressed as :host([attr="value"]) selectors and booleans by presence,
// so no JavaScript is needed to keep styling in sync with state.
//
// Design tokens cross the shadow boundary by custom-property inheritance. The host
// page loads assets/tokens.css once on :root; components only ever read var(--qbc-*).

export const QBC_SHARED_CSS = `
  :host {
    box-sizing: border-box;
    font-family: var(--qbc-font-sans, system-ui, sans-serif);
    color: var(--qbc-ink, #18201d);
    line-height: var(--qbc-lh-base, 1.5);
  }
  :host([hidden]) { display: none !important; }
  *, *::before, *::after { box-sizing: border-box; }
  button, input, textarea, select { font: inherit; color: inherit; }
  button, select { cursor: pointer; }
  button:disabled { cursor: not-allowed; opacity: .52; }
  a { color: inherit; }
  :focus-visible {
    outline: 3px solid var(--qbc-focus-ring, rgba(39, 103, 73, .25));
    outline-offset: 2px;
  }
  .visually-hidden {
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    border: 0;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
`;

export class QbcElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    if (!this._rendered) {
      this.render();
      this._rendered = true;
    }
  }

  render() {
    const css = this.styles ? this.styles() : '';
    const html = this.template ? this.template() : '';
    this.shadowRoot.innerHTML = `<style>${QBC_SHARED_CSS}${css}</style>${html}`;
    if (this.afterRender) this.afterRender();
  }

  /** Read an attribute with a fallback. */
  attr(name, fallback = '') {
    return this.getAttribute(name) ?? fallback;
  }

  /** Read a presence-based boolean attribute. */
  battr(name) {
    return this.hasAttribute(name);
  }

  /** Dispatch a shadow-piercing custom event. */
  emit(name, detail = {}, options = {}) {
    return this.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
      ...options,
    }));
  }
}

/** Escape interpolated text so attribute values and copy cannot break out of markup. */
export function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Derive up to two uppercase initials from a person's name. */
export function initials(name) {
  const parts = String(name ?? '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return parts.slice(0, 2).map(part => part[0].toUpperCase()).join('');
}
