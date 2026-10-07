import { addons } from 'storybook/manager-api';

import qbcTheme from './theme';

addons.setConfig({
  theme: qbcTheme,
  // Docs-first: the addon panel opens on demand.
  showPanel: false,
  sidebar: {
    showRoots: true,
  },
});
