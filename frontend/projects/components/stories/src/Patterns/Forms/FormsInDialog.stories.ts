import type { StoryObj } from '@storybook/angular';

import { epicOptions, ownerOptions, pointOptions } from '../shared/workboard';
import { storyFields, storyForm } from './forms';

export const InDialog: StoryObj = {
  name: 'In a dialog',
  render: () => ({
    props: { form: storyForm(), epicOptions, ownerOptions, pointOptions },
    template: `
      <qbc-button (click)="editor.open()">＋ New story</qbc-button>
      <form [formGroup]="form">
        <qbc-dialog
          #editor
          title="New story"
          subtitle="Capture a small, valuable outcome and the work needed to deliver it."
          closeLabel="Close story editor"
        >
          <div body>${storyFields}</div>
          <qbc-action-group actions>
            <qbc-button variant="secondary" (click)="editor.close()">Cancel</qbc-button>
            <qbc-button type="submit">Save story</qbc-button>
          </qbc-action-group>
        </qbc-dialog>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('qbc-button button')?.click();
  },
  parameters: {
    docs: {
      story: { inline: false, height: '760px' },
      description: {
        story:
          '`qbc-dialog` is a native modal `<dialog>`: call `open()` from a template reference and it traps focus, closes on Escape or a backdrop click, and returns focus to *New story* when it closes. The story opens it on load.',
      },
    },
  },
};
