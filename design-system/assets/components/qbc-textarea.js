// <qbc-textarea label="" value="" placeholder="" hint="" required>
//
// The multi-line field, used for a story's description and its acceptance criteria.
// It is qbc-text-input with the mock's textarea box: no fixed height, a 95px floor, and
// a vertical resize grip the author can pull down when the criteria run long.
//
// Ids come from a static counter so the label and hint associations hold when a dialog
// renders several of these at once. The label/hint/required treatment is duplicated
// from qbc-field rather than composed from it, for the reason given in that file.
//
// The native `input` event is composed, so it already crosses the shadow boundary and
// reaches listeners on this element. Nothing is re-dispatched.

import { QbcElement, esc } from './qbc-base.js';

class QbcTextarea extends QbcElement {
  static nextId = 0;

  static get observedAttributes() { return ['label', 'value', 'placeholder', 'hint', 'required']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  constructor() {
    super();
    // Minted once per instance so the association survives every re-render.
    this._uid = `field-${QbcTextarea.nextId++}`;
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
      /* Decorative marker; the control's own required state is what gets announced. */
      .required { color: var(--qbc-danger); }

      textarea {
        display: block;
        width: 100%;
        min-height: 95px;
        padding: 10px 12px;
        border: 1px solid var(--qbc-line-strong);
        border-radius: var(--qbc-r-control);
        background: var(--qbc-panel);
        color: var(--qbc-ink);
        resize: vertical;
      }
      textarea::placeholder { color: var(--qbc-placeholder); }
      /* The shared base sets a 2px offset on :focus-visible; fields in the mock sit
         flush against their ring, so the offset is zeroed here. */
      textarea:focus {
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
    const required = this.battr('required');
    const marker = required ? ' <span class="required" aria-hidden="true">*</span>' : '';
    return `
      ${label ? `<label for="${id}">${esc(label)}${marker}</label>` : ''}
      <textarea
        id="${id}"
        placeholder="${esc(this.attr('placeholder'))}"
        ${hint ? `aria-describedby="${hintId}"` : ''}
        ${required ? 'required' : ''}>${esc(this.attr('value'))}</textarea>
      ${hint ? `<span class="field-hint" id="${hintId}">${esc(hint)}</span>` : ''}
    `;
  }
}

customElements.define('qbc-textarea', QbcTextarea);
