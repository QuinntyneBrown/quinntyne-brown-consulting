// <qbc-sprint-hero eyebrow="Current sprint · Sprint 14" goal="…" dates="…" complete="2" total="5">
//
// The active sprint summary that opens the board. This is the only gradient surface in the
// product; every other panel is flat. The completion figure is stated twice on purpose,
// once as a sentence and once as a meter, so the progress bar never carries the number
// alone.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-progress.js';

class QbcSprintHero extends QbcElement {
  static get observedAttributes() { return ['eyebrow', 'goal', 'dates', 'complete', 'total']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      section {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 34px;
        align-items: end;
        margin-bottom: 30px;
        padding: 27px 30px;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-xl);
        background: var(--qbc-sprint-hero-bg);
      }

      .eyebrow {
        margin: 0 0 6px;
        color: var(--qbc-accent);
        font-size: var(--qbc-fs-2xs);
        font-weight: var(--qbc-fw-heavy);
        letter-spacing: var(--qbc-tracking-eyebrow);
        text-transform: uppercase;
      }
      h2 {
        margin: 0;
        font-size: var(--qbc-fs-4xl);
        letter-spacing: var(--qbc-tracking-heading);
      }
      /* The mock names this class for the sprint goal but fills it with the date range. */
      .goal { margin: 7px 0 0; color: var(--qbc-ink-soft); }

      .sprint-meta { min-width: 230px; }
      .sprint-meta-line {
        display: flex;
        justify-content: space-between;
        margin-bottom: 9px;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-xs);
      }

      .hero-actions { display: flex; flex-wrap: wrap; gap: 6px; }
      /* Spacing rides on the slotted children so an unused actions slot adds no height. */
      slot[name="actions"]::slotted(*) { margin-top: 14px; }

      @media (max-width: 760px) {
        section { grid-template-columns: 1fr; padding: 22px; }
      }
    `;
  }

  template() {
    const complete = Number(this.attr('complete', '0')) || 0;
    const total = Number(this.attr('total', '0')) || 0;
    const percentage = total ? Math.round((complete / total) * 100) : 0;
    const dates = this.attr('dates');
    return `
      <section aria-label="Current sprint summary">
        <div>
          <p class="eyebrow">${esc(this.attr('eyebrow', 'Current sprint'))}</p>
          <h2>${esc(this.attr('goal'))}</h2>
          ${dates ? `<p class="goal">${esc(dates)}</p>` : ''}
        </div>
        <div class="sprint-meta">
          <div class="sprint-meta-line">
            <span>${complete} of ${total} stories complete</span>
            <strong>${percentage}%</strong>
          </div>
          <qbc-progress value="${percentage}"></qbc-progress>
          <div class="hero-actions"><slot name="actions"></slot></div>
        </div>
      </section>
    `;
  }
}

customElements.define('qbc-sprint-hero', QbcSprintHero);
