// <qbc-select label="" value="" options="value:Label,value:Label" hint="" required>
//
// The labelled select. Options are declared as one compact attribute — a comma-separated
// list of value:Label pairs — because every choice list in this product is a short fixed
// set (story points, status, assignee) that reads better inline than as a dozen slotted
// option elements. Each pair splits on its FIRST colon only, so an empty value is
// expressible as ":Choose points" for the placeholder row and a label may contain colons.
//
// Improvement on the mock: the native `change` event is not composed, so unlike `input`
// it stops at the shadow boundary and would never reach a listener on this element.
// The change is therefore re-dispatched from the host, carrying the selected value on
// `event.detail.value` — the host exposes no value property, by the attributes-only rule.

import { QbcElement, esc } from './qbc-base.js';

class QbcSelect extends QbcElement {
  static nextId = 0;

  static get observedAttributes() { return ['label', 'value', 'options', 'hint', 'required']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  constructor() {
    super();
    // Minted once per instance so the association survives every re-render.
    this._uid = `field-${QbcSelect.nextId++}`;
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

      select {
        width: 100%;
        height: var(--qbc-control-h);
        padding: 0 12px;
        border: 1px solid var(--qbc-line-strong);
        border-radius: var(--qbc-r-control);
        color: var(--qbc-ink);
        background: var(--qbc-panel);
      }
      /* The shared base sets a 2px offset on :focus-visible; fields in the mock sit
         flush against their ring, so the offset is zeroed here. */
      select:focus {
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

  /** Parse "value:Label,value:Label" into option records, splitting on the first colon. */
  parseOptions() {
    return this.attr('options')
      .split(',')
      .map(pair => pair.trim())
      .filter(Boolean)
      .map(pair => {
        const at = pair.indexOf(':');
        if (at === -1) return { value: pair, label: pair };
        return { value: pair.slice(0, at), label: pair.slice(at + 1) };
      });
  }

  template() {
    const id = this._uid;
    const hintId = `${id}-hint`;
    const label = this.attr('label');
    const hint = this.attr('hint');
    const value = this.attr('value');
    const required = this.battr('required');
    const marker = required ? ' <span class="required" aria-hidden="true">*</span>' : '';
    const options = this.parseOptions()
      .map(option => `<option value="${esc(option.value)}"${option.value === value ? ' selected' : ''}>${esc(option.label)}</option>`)
      .join('');
    return `
      ${label ? `<label for="${id}">${esc(label)}${marker}</label>` : ''}
      <select
        id="${id}"
        ${hint ? `aria-describedby="${hintId}"` : ''}
        ${required ? 'required' : ''}>${options}</select>
      ${hint ? `<span class="field-hint" id="${hintId}">${esc(hint)}</span>` : ''}
    `;
  }

  afterRender() {
    const select = this.shadowRoot.querySelector('select');
    select.addEventListener('change', () => this.emit('change', { value: select.value }));
  }
}

customElements.define('qbc-select', QbcSelect);
