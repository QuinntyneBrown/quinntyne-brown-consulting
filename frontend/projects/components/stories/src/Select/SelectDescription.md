A labelled native `<select>` for forms such as story and sprint editors. `qbc-select` takes `options` as `SelectItem`s: plain `{ value, label, disabled? }` options, or `{ label, options }` groups that render as `<optgroup>`. Values may be strings, numbers, booleans or `null`.

It is a form control (`formControl` / `ngModel`), and also accepts a one-way `value` input and emits `valueChange`. Other inputs: `label`, `hint`, `required`, `disabled`, `full` (span the whole `qbc-form-grid` row), `labelHidden`, `size` (`md` default, or `sm`) and `ariaLabel`.
