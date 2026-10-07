## Best practices

### Layout

- Use `sm` for a single decision and `md` for forms.
- Put the primary action last in `[actions]`, with Cancel before it as a secondary button.

### Content

- Use the subtitle for context (dates, story points), not for instructions.
- Show form errors at the top of `[body]` with `qbc-form-error`.

### Accessibility

- Open it from a button; focus returns to the trigger on close.
- Escape and a backdrop click both close it, so never put unsaved work behind a dialog without a confirm.
