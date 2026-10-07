## Best practices

### Layout

- Use `full` inside `qbc-form-grid` for long fields such as titles.
- Use `size="sm"` only in dense rows like task items.

### Content

- Label fields with nouns ("Story title"); use the hint for format or guidance.
- Do not use the placeholder as a label.

### Accessibility

- Always give a `label`; hide it with `labelHidden` or use `ariaLabel` only when context makes the purpose obvious.
- The hint is linked with `aria-describedby` automatically.
