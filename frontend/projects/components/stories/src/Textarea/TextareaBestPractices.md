## Best practices

### Layout

- Use `full` inside `qbc-form-grid`; long text needs the width.

### Content

- Use it for free text such as story descriptions; use `qbc-text-input` for single-line values.
- Put format guidance in `hint`, not the placeholder.

### Accessibility

- Always set `label` (or `ariaLabel` when a visible label is impossible).
- The hint is linked with `aria-describedby` automatically.
