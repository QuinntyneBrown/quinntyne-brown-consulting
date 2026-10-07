The frame every workboard screen renders inside, exactly as `projects/qbc-workboard/src/app/shell/app-shell.component.html` composes it:

- **`qbc-app-shell`** owns the layout and starts with a skip link to `<main id="main-content">`. It has four slots: `[navigation]`, `[topbar]`, `[content]` and `[feedback]` (an `aria-live="polite"` region for `qbc-toast`).
- **`qbc-sidebar`** is fixed at `--qbc-sidebar-w`, holds `qbc-brand` in `[brand]` and one `qbc-nav-item` per destination — Board, Backlog, Initiatives, Assistants. Each nav item is a router link that marks itself active.
- **`qbc-topbar`** shows the breadcrumb and the one global action (＋ New story). Below 900px it swaps the breadcrumb for a menu button that toggles the sidebar drawer through `navOpen` / `menuToggled`.
- **`qbc-page`** centres content at `--qbc-page-max`, and **`qbc-page-header`** gives every screen its single `<h1>`, a one-line description and an `[actions]` slot.

Close the drawer when a nav item emits `activated`, so choosing a destination on a phone also dismisses the menu.
