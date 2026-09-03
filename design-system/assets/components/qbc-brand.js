// <qbc-brand mark="Q" name="QBC" tagline="Workboard" href="/">
//
// The product lockup. The mark is a letterform on an accent tile, not an image asset,
// so there is no logo file to keep in sync and the whole lockup recolours with the
// accent token. Setting `href` turns the lockup into the home link; without it the
// component renders inert text, which is what a topbar or a print header wants.
//
// The mock's .brand also carries `margin: 0 8px 42px`. That spacing positions the
// lockup inside the sidebar rather than describing the lockup, so it stays with the
// layout and is not reproduced here.

import { QbcElement, esc } from './qbc-base.js';

class QbcBrand extends QbcElement {
  static get observedAttributes() { return ['mark', 'name', 'tagline', 'href']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      .brand {
        display: flex;
        gap: var(--qbc-s-3);
        align-items: center;
        color: inherit;
        text-decoration: none;
      }

      .brand-mark {
        display: grid;
        width: 38px;
        height: 38px;
        flex: none;
        place-items: center;
        border-radius: var(--qbc-r-md);
        background: var(--qbc-accent);
        color: #fff;
        font-size: var(--qbc-fs-2xl);
        font-weight: var(--qbc-fw-bold);
      }

      .brand strong, .brand small { display: block; }
      .brand strong { letter-spacing: var(--qbc-tracking-brand); }
      .brand small {
        margin-top: -2px;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-2xs);
      }
    `;
  }

  template() {
    const mark = this.attr('mark', 'Q');
    const name = this.attr('name', 'QBC');
    const tagline = this.attr('tagline', 'Workboard');
    const href = this.attr('href', '');

    // Conditional element: a link only when there is somewhere to go. The label names
    // the destination once, so the wordmark and tagline are not read out twice.
    const open = href
      ? `<a class="brand" href="${esc(href)}" aria-label="${esc(`${name} ${tagline} home`)}">`
      : '<span class="brand">';
    const close = href ? '</a>' : '</span>';

    return `
      ${open}
        <span class="brand-mark" aria-hidden="true">${esc(mark)}</span>
        <span>
          <strong>${esc(name)}</strong>
          <small>${esc(tagline)}</small>
        </span>
      ${close}
    `;
  }
}

customElements.define('qbc-brand', QbcBrand);
