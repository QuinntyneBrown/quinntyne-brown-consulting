## Best practices

### Layout

- Pin toasts to one corner of the viewport and stack new ones with a small gap.

### Content

- Say what happened in one sentence and name the item ("Story QBC-142 moved").
- For errors, say what to do next.

### Accessibility

- Render toasts inside a `role="status"` (or `role="alert"` for errors) live region so they are announced.
- Leave toasts up long enough to read, and never put the only copy of important information in one.
