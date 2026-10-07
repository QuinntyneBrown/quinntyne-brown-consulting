The sticky header above every Workboard page. `qbc-topbar` shows a `breadcrumb` (default "Workspace / Board") on the left and its projected content (the page's global actions) on the right.

Below 900px the breadcrumb is hidden and a menu `qbc-icon-button` appears to open the sidebar drawer. It emits `menuToggled` when pressed; `navOpen` sets the button's `aria-expanded` and `menuLabel` its accessible name (default "Open navigation").
