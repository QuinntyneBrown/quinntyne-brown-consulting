A fixed-length numeric passcode field, used to unlock a client's workboard. `qbc-passcode-input` keeps one real, transparent `<input>` over a row of boxes, so paste, numeric keypads and one-time-code autofill all work and there is a single focus target. Each typed digit renders as a masked dot; non-digits are stripped.

Inputs are `label` (visually hidden, default "Passcode"), `length` (default 4), `disabled`, `invalid`, `accepted` and `describedBy`. It is a form control (`formControl` / `ngModel`), and also emits `valueChange` on every edit and `completed` once all boxes are filled.
