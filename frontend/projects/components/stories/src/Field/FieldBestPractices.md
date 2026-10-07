## Best practices

### Layout

- Use it inside `qbc-form-grid`; set `full` for wide controls such as text areas.

### Content

- Prefer `qbc-text-input`, `qbc-select` and `qbc-textarea`, which carry their own labels; reach for `qbc-field` only for custom controls.
- Keep hints to one short sentence.

### Accessibility

- The label is a plain span, not a `<label>`, so give the projected control an `aria-label` (or `aria-labelledby`) that matches it.
