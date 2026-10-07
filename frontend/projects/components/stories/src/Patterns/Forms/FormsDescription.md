How the workboard collects input, following the story editor (`features/stories/story-editor.component.html`):

- **`qbc-form-grid`** lays fields out in two columns (one below 760px). Short fields — selects, numbers, dates — sit side by side; anything long sets **`full`** to span the row.
- **`qbc-text-input`**, **`qbc-textarea`**, **`qbc-select`** and **`qbc-checkbox`** render their own `<label>`, required marker and `hint`, and implement `ControlValueAccessor`, so they bind straight to `formControlName`. Use `required` to show the marker; validation itself lives on the form control.
- **`qbc-field`** labels anything that is not one of those controls — here a group of checkboxes. It is presentation only: the control inside still needs its own accessible name.
- **`qbc-form-error`** is a `role="alert"` banner at the top of the form for a failed save or a server message.
- **`qbc-action-group`** holds the buttons. `align="end"` for a plain form; `align="between"` when destructive actions (Archive, Delete) go on the left and Cancel / Save on the right. One primary button — the submit.

Long forms open in a **`qbc-dialog`**: the grid goes in `[body]` and the action group in `[actions]`.
