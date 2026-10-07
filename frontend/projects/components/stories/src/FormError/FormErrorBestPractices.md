## Best practices

### Layout

- Put it above the form or list it refers to; in a dialog, project it into `[body]`.

### Content

- Say what went wrong and what to do next in one or two sentences.
- Render it only while there is an error; an empty banner still takes space.

### Accessibility

- `role="alert"` announces the message as soon as it is added, so add it once rather than re-rendering on every keystroke.
