// <qbc-field label="Label" hint="" required full>
//
// The label/hint/required chrome from the mock's `.field`, wrapped around a control the
// author supplies. Use it for anything the design system does not ship as a dedicated
// input — a checkbox, a native select the page already owns, a composed control.
//
// The label element wraps the slot rather than pointing at the control with `for`,
// because the control lives in this element's light DOM and its id is not ours to
// invent or overwrite. Note the consequence: implicit label association is resolved on
// the DOM tree, not the flattened tree, so the wrapping label styles and positions the
// text but does not name the slotted control. The control must carry its own accessible
// name, as the manifest example does with aria-label. The dedicated inputs
// (qbc-text-input, qbc-textarea, qbc-select) own their control and do wire `for`/`id`.

import { QbcElement, esc } from './qbc-base.js';

class QbcField extends QbcElement {
  static get observedAttributes() { return ['label', 'hint', 'required', 'full']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }
      :host([full]) { grid-column: 1 / -1; }

      .label-text {
        display: block;
        margin-bottom: 6px;
        font-size: var(--qbc-fs-xs);
        font-weight: var(--qbc-fw-semibold);
      }
      /* The asterisk is decorative and hidden from assistive technology. The slotted
         control carries the required state, which is what actually gets announced. */
      .required { color: var(--qbc-danger); }

      .field-hint {
        display: block;
        margin-top: 5px;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
    `;
  }

  template() {
    const hint = this.attr('hint');
    const marker = this.battr('required') ? ' <span class="required" aria-hidden="true">*</span>' : '';
    return `
      <label>
        <span class="label-text">${esc(this.attr('label', 'Label'))}${marker}</span>
        <slot></slot>
      </label>
      ${hint ? `<span class="field-hint">${esc(hint)}</span>` : ''}
    `;
  }
}

customElements.define('qbc-field', QbcField);
