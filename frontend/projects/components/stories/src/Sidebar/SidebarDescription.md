The fixed left-hand navigation rail of the Workboard shell. `qbc-sidebar` renders an `<aside aria-label="Main navigation">` with three regions: a brand slot (project content with the `brand` attribute, usually a `qbc-brand`), the default slot inside a `<nav>` for `qbc-nav-item` links, and a footer line.

`footer` sets the footer text (default "Quinntyne Brown Consulting Inc.") and keeps line breaks. `open` only matters below 900px, where the sidebar becomes an off-canvas drawer that slides in when `open` is true.

The stories wrap the sidebar in a transformed frame so its `position: fixed` stays inside the preview.
