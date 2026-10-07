## Best practices

### Layout

- Render one sidebar per page, as a sibling of the main content; it is fixed to the left edge at `--qbc-sidebar-w`.
- Drive `open` from the top bar's menu button so the drawer and the button's `aria-expanded` stay in sync.

### Content

- Put a single `qbc-brand` in the `brand` slot and only `qbc-nav-item` links in the default slot.
- Keep the destinations to the top-level areas: Board, Backlog, Initiatives, Assistants.

### Accessibility

- The aside is already labelled "Main navigation"; do not add a second navigation landmark with the same name.
- Close the drawer after a nav item is activated on small screens so focus returns to the page.
