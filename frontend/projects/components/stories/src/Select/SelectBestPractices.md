## Best practices

### Layout

- Use `full` inside a `qbc-form-grid` when the field should span both columns.
- Use `size="sm"` only in toolbars and filters, not in forms.

### Content

- Offer an explicit `null` option ("Not estimated", "No epic") when a value is optional.
- Use groups when the list has a natural parent, such as epics by initiative.

### Accessibility

- Always provide `label`; use `labelHidden` rather than omitting it when space is tight.
- Use `hint` for constraints; it is linked with `aria-describedby`.
