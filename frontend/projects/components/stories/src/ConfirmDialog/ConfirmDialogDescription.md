A small, danger-toned confirmation built on `qbc-dialog`. `qbc-confirm-dialog` has no inputs: call `open(title, copy, confirmLabel = 'Confirm')` on it (through a template reference or `viewChild`) and await the returned `Promise<boolean>`.

The promise resolves `true` when the danger button is pressed, and `false` on Cancel, the close button, Escape or a backdrop click.
