import { provideRouter, withHashLocation } from '@angular/router';
import { setCompodocJson } from '@storybook/addon-docs/angular';
import { applicationConfig, type Preview } from '@storybook/angular';

import docJson from '../documentation.json';

// Inputs, outputs and JSDoc for the autodocs ArgTypes tables come from
// compodoc (`compodoc: true` on the angular.json storybook targets).
setCompodocJson(docJson);

/**
 * Every story renders inside the same global chrome as the app: the
 * `storybook.scss` entry (`angular.json` → `styles`) loads the library's
 * `styles.scss` tokens and reset. A router is provided because `qbc-brand`,
 * `qbc-nav-item` and the link components use `routerLink`; hash location plus
 * a catch-all route keep those clicks inside the preview iframe instead of
 * rewriting `iframe.html`.
 */
const preview: Preview = {
  decorators: [
    applicationConfig({
      providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())],
    }),
  ],
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        panel: { name: 'Panel (--qbc-panel)', value: '#fff' },
        soft: { name: 'Soft (--qbc-soft)', value: '#f5f7f5' },
        raised: { name: 'Raised (--qbc-surface-raised)', value: '#fbfcfb' },
      },
    },
    viewport: {
      // The app collapses its sidebar at 900px (`styles.scss`).
      options: {
        mobile: {
          name: 'Mobile (390×844)',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (820×1180)',
          styles: { width: '820px', height: '1180px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1440×900)',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i },
    },
    a11y: {
      // Fail the a11y panel loudly; the workboard targets WCAG 2.2 AA.
      test: 'error',
    },
    docs: {
      toc: { headingSelector: 'h2, h3' },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        /**
         * @see https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy#sorting-stories
         */
        order: [
          'Concepts',
          [
            'Introduction',
            'Developer',
            ['Quick Start', 'Styling Components', 'Accessibility', 'Writing Stories'],
          ],
          'Theme',
          ['Overview', 'Colors', 'Typography', 'Spacing', 'Border Radii', 'Shadows', 'Motion'],
          'Components',
          'Patterns',
        ],
      },
    },
  },
};

export default preview;
