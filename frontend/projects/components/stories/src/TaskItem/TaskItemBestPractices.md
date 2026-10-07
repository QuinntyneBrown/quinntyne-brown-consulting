## Best practices

### Layout

- Project exactly the four controls in order so they line up with the grid columns.
- Stack rows with a small gap in the story editor.

### Content

- Bind `done` to the same value as the checkbox so the dimming matches the state.
- Write task titles as short actions ("Parse uploaded CSV").

### Accessibility

- The controls have no visible labels in a row, so give each an `ariaLabel` that includes the task number.
