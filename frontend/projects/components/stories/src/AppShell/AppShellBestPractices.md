## Best practices

### Layout

- Render one shell per page, at the root of the routed view.
- Put page content in the `[content]` slot so it lands inside `<main>` and is the skip link's target.

### Content

- Use the `[feedback]` slot only for transient messages such as `qbc-toast`.

### Accessibility

- The shell supplies the skip link and the `main` landmark; do not add another `main` inside `[content]`.
- The feedback region is `aria-live="polite"`, so toasts are announced without stealing focus.
