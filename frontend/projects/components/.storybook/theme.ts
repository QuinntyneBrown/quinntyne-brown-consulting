import { create } from 'storybook/theming';

/**
 * Brands the Storybook manager with the QBC palette. The manager runs outside
 * the preview iframe, so it cannot read the `--qbc-*` custom properties; these
 * values mirror `src/styles.scss` and the Storybook catalog test fails if one
 * of them stops appearing there.
 * See https://storybook.js.org/docs/configure/user-interface/theming
 */
export const managerTokens = {
  accent: '#276749', // --qbc-accent
  accentDark: '#184c35', // --qbc-accent-dark
  ink: '#18201d', // --qbc-ink
  inkSoft: '#68726d', // --qbc-ink-soft
  line: '#e4e9e6', // --qbc-line
  lineStrong: '#d8dfdb', // --qbc-line-strong
  panel: '#fff', // --qbc-panel
  soft: '#f5f7f5', // --qbc-soft
} as const;

const t = managerTokens;

const theme = create({
  base: 'light',

  colorPrimary: t.accent,
  colorSecondary: t.accent,

  // UI
  appBg: t.soft,
  appContentBg: t.panel,
  appPreviewBg: t.panel,
  appBorderColor: t.line,
  appBorderRadius: 10,

  // Fonts
  fontBase:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontCode: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",

  // Text colors
  textColor: t.ink,
  textMutedColor: t.inkSoft,
  textInverseColor: t.panel,

  // Toolbar default and active colors
  barTextColor: t.inkSoft,
  barSelectedColor: t.accent,
  barHoverColor: t.accentDark,
  barBg: t.panel,

  // Form colors
  inputBg: t.panel,
  inputBorder: t.lineStrong,
  inputTextColor: t.ink,
  inputBorderRadius: 8,

  brandTitle: 'QBC Workboard Design System',
  brandUrl: 'https://github.com/QuinntyneBrown/quinntyne-brown-consulting',
  brandImage: './qbc-wordmark.svg',
  brandTarget: '_self',
});

export default theme;
