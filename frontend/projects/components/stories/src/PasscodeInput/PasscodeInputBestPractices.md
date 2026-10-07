## Best practices

### Content

- Submit on `completed` instead of asking for a separate button press.
- Clear the value after an `invalid` attempt so the next try starts from the first box.

### Layout

- The field centres itself; put error or help text directly below it.

### Accessibility

- Always set a meaningful `label`; it is the only accessible name.
- Connect error text with `describedBy` when `invalid` is set.
