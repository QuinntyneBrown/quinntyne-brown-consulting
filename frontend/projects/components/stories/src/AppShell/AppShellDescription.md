The page frame of the Workboard. `qbc-app-shell` renders a skip link, then four content-projection slots: `[navigation]` (usually `qbc-sidebar`), `[topbar]` (usually `qbc-topbar`), `[content]` (placed inside `<main id="main-content">`) and `[feedback]` (a fixed, polite live region for toasts).

It has no inputs. The workspace is offset by `--qbc-sidebar-w` and collapses to full width below 900px, where the sidebar slides away.
