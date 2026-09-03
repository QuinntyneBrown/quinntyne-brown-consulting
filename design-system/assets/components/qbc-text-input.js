// <qbc-text-input label="" value="" placeholder="" type="text|email|password|number|date|search" hint="" required>
//
// The single-line field. It owns its control, so unlike qbc-field it can wire the
// label's `for` to the input's `id` and point `aria-describedby` at the hint. Ids are
// minted from a static counter because a dialog in this product renders many of these
// at once and a fixed id would collide across instances.
//
// The label/hint/required treatment is duplicated from qbc-field rather than composed
// from it: nesting one shadow root inside another to reuse three rules would put a
// second host box between the label and the control for no gain.
//
// The native `input` event is composed, so it already crosses the shadow boundary and
// reaches listeners on this element. Nothing is re-dispatched.

import { QbcElement, esc } from './qbc-base.js';

const TYPES = ['text', 'email', 'password', 'number', 'date', 'search'];

class QbcTextInput extends QbcElement {
  static nextId = 0;

  static get observedAttributes() { return ['label', 'value', 'placeholder', 'type', 'hint', 'required']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  constructor() {
    super();
    // Minted once per instance so the association survives every re-render.
    this._uid = `field-${QbcTextInput.nextId++}`;
  }

  styles() {
    return `
      :host { display: block; }

      label {
        display: block;
        margin-bottom: 6px;
        font-size: var(--qbc-fs-xs);
        font-weight: var(--qbc-fw-semibold);
      }
      /* Decorative marker; the input's own required state is what gets announced. */
      .required { color: var(--qbc-danger); }

      input {
        width: 100%;
        height: var(--qbc-control-h);
        padding: 0 12px;
        border: 1px solid var(--qbc-line-strong);
        border-radius: var(--qbc-r-control);
        color: var(--qbc-ink);
        background: var(--qbc-panel);
      }
      input::placeholder { color: var(--qbc-placeholder); }
      /* The shared base sets a 2px offset on :focus-visible; fields in the mock sit
         flush against their ring, so the offset is zeroed here. */
      input:focus {
        border-color: var(--qbc-accent);
        outline: 3px solid var(--qbc-focus-ring-field);
        outline-offset: 0;
      }

      .field-hint {
        display: block;
        margin-top: 5px;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
    `;
  }

  template() {
    const id = this._uid;
    const hintId = `${id}-hint`;
    const label = this.attr('label');
    const hint = this.attr('hint');
    const type = TYPES.includes(this.attr('type')) ? this.attr('type') : 'text';
    const required = this.battr('required');
    const marker = required ? ' <span class="required" aria-hidden="true">*</span>' : '';
    return `
      ${label ? `<label for="${id}">${esc(label)}${marker}</label>` : ''}
      <input
        id="${id}"
        type="${esc(type)}"
        value="${esc(this.attr('value'))}"
        placeholder="${esc(this.attr('placeholder'))}"
        ${hint ? `aria-describedby="${hintId}"` : ''}
        ${required ? 'required' : ''}>
      ${hint ? `<span class="field-hint" id="${hintId}">${esc(hint)}</span>` : ''}
    `;
  }
}

customElements.define('qbc-text-input', QbcTextInput);
