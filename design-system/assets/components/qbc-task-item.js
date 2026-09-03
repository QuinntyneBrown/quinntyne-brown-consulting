// <qbc-task-item title="Draft the summary query" assignee="Noah Williams" done>
//
// One checklist item inside a story. The title field is the system's single quiet-editing
// affordance: borderless at rest so a list of tasks reads as prose, and only drawn as a
// field on hover or focus. Completion is carried by both the checkbox and the
// strikethrough, never by colour alone.
//
// The component is controlled. Toggling the checkbox emits change with detail.done and
// nothing else; the owner decides whether the task is really complete and sets the done
// attribute back, which is what drives the strikethrough.

import { QbcElement, esc } from './qbc-base.js';
import './qbc-icon-button.js';

class QbcTaskItem extends QbcElement {
  static get observedAttributes() { return ['title', 'assignee', 'done']; }
  attributeChangedCallback() { if (this._rendered) this.render(); }

  styles() {
    return `
      :host { display: block; }

      .task-item {
        display: grid;
        grid-template-columns: auto 1fr 160px auto;
        gap: 9px;
        align-items: center;
        padding: 9px;
        border: 1px solid var(--qbc-line);
        border-radius: var(--qbc-r-control);
      }

      input[type="checkbox"] { width: 18px; height: 18px; margin: 0; }

      .task-name-input {
        width: 100%;
        height: 34px;
        padding: 0 6px;
        border: 1px solid transparent;
        border-radius: var(--qbc-r-control);
        background: transparent;
        color: var(--qbc-ink);
      }
      .task-name-input:hover, .task-name-input:focus {
        border-color: var(--qbc-line);
        background: var(--qbc-panel);
      }
      /* The field ring, not the shared control ring: this input sits inside a row and an
         offset outline would collide with the row border. */
      .task-name-input:focus {
        outline: 3px solid var(--qbc-focus-ring-field);
        outline-offset: 0;
      }
      :host([done]) .task-name-input {
        color: var(--qbc-ink-soft);
        text-decoration: line-through;
      }

      .assignee {
        overflow: hidden;
        color: var(--qbc-ink-soft);
        font-size: var(--qbc-fs-xs);
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      @media (max-width: 760px) {
        .task-item { grid-template-columns: auto 1fr auto; }
        .assignee { grid-column: 2 / -1; }
      }
    `;
  }

  template() {
    const title = this.attr('title');
    const assignee = this.attr('assignee');
    return `
      <div class="task-item">
        <input type="checkbox" ${this.battr('done') ? 'checked' : ''}
          aria-label="Mark ${esc(title)} complete">
        <input class="task-name-input" type="text" value="${esc(title)}" aria-label="Task title" required>
        <span class="assignee">${assignee ? esc(assignee) : 'Unassigned'}</span>
        <qbc-icon-button icon="close" variant="bare" label="Delete ${esc(title)}"></qbc-icon-button>
      </div>
    `;
  }

  afterRender() {
    const checkbox = this.shadowRoot.querySelector('input[type="checkbox"]');
    // The native change event is not composed, so it stops at the shadow root. Re-emitting
    // is what lets a listener on the host see the toggle at all.
    checkbox.addEventListener('change', () => this.emit('change', { done: checkbox.checked }));
  }
}

customElements.define('qbc-task-item', QbcTaskItem);
