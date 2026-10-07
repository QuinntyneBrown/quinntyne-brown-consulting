## Best practices

### Layout

- Render it as the very first focusable element in the app shell, before the sidebar.

### Content

- Keep the label short and name the destination, e.g. "Skip to content".

### Accessibility

- Give the target element `tabindex="-1"` so it can receive programmatic focus.
- Make sure the `target` id exists on every page; when it is missing the link falls back to its href.
