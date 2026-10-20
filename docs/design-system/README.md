# QBC Workboard design system

Extracted from [docs/mocks](../mocks/index.html) on 2026-10-16. Open [index.html](index.html) in a browser.

Light and dark themes, WCAG 2.2 AA, tokens in one file. The Angular library in `frontend/projects/components` (and its Storybook) is the implementation; this folder is the design reference it should match.

## Foundations

| Page | Covers |
|---|---|
| [Color](foundations/color.html) | Ramps, roles, status, both themes, contrast pairs |
| [Typography](foundations/typography.html) | Inter, 12–42px scale, weights, roles |
| [Spacing](foundations/spacing.html) | 4px scale, inside/between rules |
| [Layout](foundations/layout.html) | Breakpoints, columns, gutters, margins, templates |
| [Elevation](foundations/elevation.html) | Shadows, surfaces, z-order |
| [Shape](foundations/shape.html) | Radii, borders |
| [Motion](foundations/motion.html) | Durations, easing, reduced motion |
| [Iconography](foundations/iconography.html) | SVG icon set and rules |
| [Theming](foundations/theming.html) | Tiers, dark, adding themes, tokens.json |
| [Responsive](foundations/responsive.html) | Per-breakpoint behaviour, touch, test matrix |
| [Accessibility](foundations/accessibility.html) | WCAG 2.2 AA commitments, testing |
| [Content](foundations/content.html) | Voice, casing, formats, microcopy |

## Components

| Component | Group | Source mocks |
|---|---|---|
| [Button](components/button.html) | Actions | index.html, board-assistant-filter.html, pin-auth.html, work-item-attachments.html |
| [Button group](components/button-group.html) | Actions | initiative-editor.html, assistant-hours.html |
| [Link](components/link.html) | Actions | assistant-hours.html, index.html |
| [Menu](components/menu.html) | Actions | index.html |
| [Text field](components/text-field.html) | Inputs | index.html, assistant-hours.html, initiative-editor.html |
| [Textarea](components/textarea.html) | Inputs | index.html, assistant-hours.html, initiative-editor.html |
| [Select](components/select.html) | Inputs | index.html, board-assistant-filter.html, initiative-editor.html |
| [Checkbox](components/checkbox.html) | Inputs | index.html |
| [Radio group](components/radio-group.html) | Inputs | assistant-hours.html, index.html |
| [Switch](components/switch.html) | Inputs | board-assistant-filter.html |
| [Passcode input](components/passcode-input.html) | Inputs | pin-auth.html |
| [File upload](components/file-upload.html) | Inputs | work-item-attachments.html |
| [Form field](components/form-field.html) | Inputs | index.html, assistant-hours.html, initiative-editor.html |
| [Form layout](components/form-layout.html) | Inputs | index.html, assistant-hours.html, initiative-editor.html |
| [Top bar](components/top-bar.html) | Navigation | index.html, assistant-hours.html |
| [Sidebar navigation](components/sidebar.html) | Navigation | index.html, styles.css |
| [Tabs](components/tabs.html) | Navigation | work-item-attachments.html, assistant-hours.html |
| [Breadcrumb](components/breadcrumb.html) | Navigation | index.html, assistant-hours.html |
| [Pagination](components/pagination.html) | Navigation | index.html |
| [Skip link](components/skip-link.html) | Navigation | index.html, styles.css |
| [Card](components/card.html) | Containers | index.html, board-assistant-filter.html, assistant-hours.html |
| [Story card](components/story-card.html) | Containers | index.html, board-assistant-filter.html |
| [Board column](components/board-column.html) | Containers | index.html, board-assistant-filter.html |
| [Dialog](components/dialog.html) | Containers | index.html, assistant-hours.html, work-item-attachments.html, initiative-editor.html |
| [Tooltip](components/tooltip.html) | Containers | initiative-editor.html |
| [Divider](components/divider.html) | Containers | index.html |
| [Layout primitives](components/layout.html) | Containers | index.html, board-assistant-filter.html, styles.css |
| [Table](components/table.html) | Data display | assistant-hours.html, index.html |
| [List](components/list.html) | Data display | index.html, assistant-hours.html |
| [Description list](components/description-list.html) | Data display | board-assistant-filter.html, assistant-hours.html |
| [Avatar](components/avatar.html) | Data display | index.html, assistant-hours.html |
| [Badge](components/badge.html) | Data display | index.html, work-item-attachments.html |
| [Chip and tag](components/chip.html) | Data display | index.html, board-assistant-filter.html |
| [Estimate chips](components/estimate.html) | Data display | index.html, assistant-hours.html |
| [Stat](components/stat.html) | Data display | assistant-hours.html |
| [Toast](components/toast.html) | Feedback | index.html, work-item-attachments.html, assistant-hours.html |
| [Alert](components/alert.html) | Feedback | index.html, work-item-attachments.html, initiative-editor.html |
| [Inline message](components/inline-message.html) | Feedback | initiative-editor.html, index.html |
| [Progress bar](components/progress.html) | Feedback | board-assistant-filter.html, index.html, work-item-attachments.html |
| [Spinner](components/spinner.html) | Feedback | initiative-editor.html, pin-auth.html |
| [Skeleton](components/skeleton.html) | Feedback | initiative-editor.html |
| [Empty state](components/empty-state.html) | Feedback | index.html, assistant-hours.html, work-item-attachments.html, board-assistant-filter.html |
| [Error page](components/error-page.html) | Feedback | index.html |

## Patterns

| Pattern |
|---|
| [Forms](patterns/forms.html) |
| [Feedback and loading](patterns/feedback.html) |
| [Empty and error states](patterns/empty-and-error.html) |
| [Navigation and page structure](patterns/navigation.html) |
| [Dialogs and overlays](patterns/dialogs.html) |
| [Data tables and lists](patterns/data-lists.html) |
| [Notifications](patterns/notifications.html) |
| [Content and tone](patterns/content-tone.html) |

## Tokens

- `tokens/tokens.css`: source of truth (primitives, semantic tokens, light and dark).
- `tokens/tokens.json`: DTCG export, generated by `tokens_to_json.py`.
- `tokens/contrast-pairs.json`: every checked foreground/background pair.
- `assets/components.css`: component styles, token-only; `assets/ds.css` and `assets/ds.js`: documentation chrome.

## Drift found in the mocks

| # | Mock | Issue | Resolution |
|---|---|---|---|
| D1 | all | Two token dialects: `styles.css` used `--ink/--accent`, pages used `--qbc-*`; some values (e.g. `#fbfcfb`, `#8a938f`) hard-coded. | One tokens.css; primitives keep the mock hex values. |
| D2 | styles.css, all | Focus ring `rgba(39,103,73,.25)` 3px outline: 1.3:1, fails 2.4.11. | Solid 2px `--color-focus-ring` with 2px offset (6.7:1). |
| D3 | styles.css | Input and secondary-button borders `#d8dfdb`/`#e4e9e6`: 1.2–1.4:1, fail 1.4.11. | `--color-border-strong` `#848e89` (3.4:1). |
| D4 | styles.css | Placeholder `#a0a9a4` (2.5:1), story key and footer `#87918c`/`#8a938f` (3.3:1). | `--color-fg-subtle` `#68726d` (5.0:1). |
| D5 | styles.css, filter | 10–11px text in pills, keys, hints, avatars. | Raised to 12px minimum. |
| D6 | styles.css | Six font weights (600–800) and 12 radii (6–20px). | Four weights, five radii + full. |
| D7 | styles.css | Off-grid spacing (5, 7, 9, 11, 13, 15, 18, 22, 23, 25, 27px) and sizes (34, 42, 82px). | Snapped to the 4px scale; inputs 40px, top bar 80px. |
| D8 | styles.css, index | Text glyphs as icons (▦ ≡ ⌘ ◎ ×). | Inline SVG icon set. |
| D9 | index | Current nav marked with `.active` only. | `aria-current="page"`. |
| D10 | styles.css | Dialog backdrop blur and translucent fills (`rgba(232,243,237,.82)`). | Solid backdrop token, solid accent-subtle. |
| D11 | editor | Toolbar relies on `title` tooltips. | Tooltip component with `aria-describedby`. |
| D12 | all | No dark theme. | Dark theme built from roles; 108 pairs pass in both themes. |
| D13 | mocks | No `manifest.json` or `pages/` folders, so the mocks checker could not run. | Extracted from the seven flat files; see Verification. |

## Verification

Run on 2026-10-16 from the repository root, with the scripts from the `extracting-design-systems` skill:

| Check | Command | Result |
|---|---|---|
| Harvest | `harvest_styles.py docs/mocks --classes` | 7 files scanned: 25 colours, 98 custom properties, 48 spacing values, 23 radii. Report kept in `.cache/` (gitignored). |
| Contrast | `check_contrast.py docs/design-system/tokens/tokens.css` | 126 pairs in light and dark: 126 passed, 0 failed, 0 unresolved. |
| Structure | `check_design_system.py docs/design-system` | 64 pages (43 components, 8 patterns, 12 foundations, index): 0 errors, 0 warnings. |
| Tokens export | `tokens_to_json.py docs/design-system/tokens/tokens.css` | `tokens/tokens.json`, 252 tokens. |
| Reflow | Playwright, every component, pattern and foundation page at 360px | No horizontal page scroll. |
| Screenshots | Playwright, Chromium: index, button, dialog, story card and color at 360 and 1280px, light and dark | Reviewed. Fixed: specimens overflowing at 360px, unwrapped code tables, story-card callouts covering the title. |

Not done:

- **Mocks checker.** `writing-html-mocks/scripts/check_mocks.py` is not installed, and `docs/mocks` has no `manifest.json` or `pages/` folders. See drift D13.
- **Closing the loop with the mocks.** `docs/mocks` was not pointed at these tokens and `components.css`. The mocks use their own class names (for example `.primary-button` rather than `.btn--primary`), so relinking them would restyle them without bringing them in line. Map the old class names to the system's first.
- **Comparison with the Angular library.** The library in `frontend/projects/components` was not compared against this system.
