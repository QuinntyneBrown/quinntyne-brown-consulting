// <qbc-avatar name="Maya Chen" size="sm|lg" unassigned>
//
// The identity mark. This product has no image avatars anywhere, so the component is
// initials only and there is no upload, no fallback chain and no broken-image state to
// design for. Initials come from the first two words of the name.
//
// Unassigned is a first-class state rather than a blank circle: grey tint, em dash. An
// avatar with no name at all is the same absence, so it renders the same way — the
// alternative is an accent-tinted circle claiming an owner that does not exist.
//
// The mock's .avatar.unassigned grey is a one-off literal with no token behind it. It
// resolves to --qbc-ink-faint here, which differs by a couple of units per channel and
// is not perceptible at this size.

import { QbcElement, esc, initials } from './qbc-base.js';

class QbcAvatar extends QbcElement {
  static get observedAttributes() { return ['name', 'size', 'unassigned']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: inline-block; }

      .avatar {
        display: inline-grid;
        width: 29px;
        height: 29px;
        place-items: center;
        border-radius: var(--qbc-r-round);
        color: var(--qbc-accent-dark);
        background: var(--qbc-accent-soft);
        font-size: 10px;
        font-weight: var(--qbc-fw-heavy);
      }

      :host([size="lg"]) .avatar {
        width: 46px;
        height: 46px;
        font-size: var(--qbc-fs-sm);
      }

      :host([unassigned]) .avatar,
      :host(:not([name])) .avatar,
      :host([name=""]) .avatar {
        color: var(--qbc-ink-faint);
        background: var(--qbc-soft);
      }
    `;
  }

  template() {
    const name = this.attr('name', '').trim();
    const empty = this.battr('unassigned') || !name;
    const label = empty ? 'Unassigned' : `Assigned to ${name}`;
    return `
      <span class="avatar" role="img" title="${esc(label)}" aria-label="${esc(label)}">${empty ? '—' : esc(initials(name))}</span>
    `;
  }
}

customElements.define('qbc-avatar', QbcAvatar);
