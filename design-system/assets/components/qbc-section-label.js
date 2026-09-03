// <qbc-section-label title="Tasks" hint="A lightweight checklist inside this story.">
//
// The small heading that opens a subsection inside a dialog, with the action that adds
// to that subsection slotted on the trailing edge. Pairing the two in one component is
// what keeps every dialog section aligned on the same baseline without each form
// re-inventing a flex row.
//
// Worth knowing: `title` is a global HTML attribute, so setting it also gives the host
// a native browser tooltip repeating the heading. The name comes from the component
// manifest and is kept for API stability; a rename to `heading` would remove the
// duplicate tooltip.

import { QbcElement, esc } from './qbc-base.js';

class QbcSectionLabel extends QbcElement {
  static get observedAttributes() { return ['title', 'hint']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host {
        display: flex;
        gap: var(--qbc-s-3);
        align-items: center;
        justify-content: space-between;
        margin: 7px 0 10px;
      }

      h3 { margin: 0; font-size: var(--qbc-fs-sm); }

      /* .field-hint, so supporting text reads the same here as it does under a field. */
      .hint {
        display: block;
        margin-top: 5px;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
    `;
  }

  template() {
    const hint = this.attr('hint', '');
    // The heading and its hint stack as one flex item, so the slotted action stays on
    // the trailing edge instead of being pushed down by a second line.
    return `
      <div>
        <h3>${esc(this.attr('title', 'Section'))}</h3>
        ${hint ? `<small class="hint">${esc(hint)}</small>` : ''}
      </div>
      <slot></slot>
    `;
  }
}

customElements.define('qbc-section-label', QbcSectionLabel);
