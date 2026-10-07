A modal sheet built on the native `<dialog>` element. `qbc-dialog` stays closed until `open()` is called and closes with `close(reason)`; the `closed` output emits a `DialogCloseReason` of `close`, `escape`, `backdrop` or `programmatic`.

Inputs: `title` (labels the dialog), `subtitle`, `size` (`md`, 680px, or `sm`, 430px) and `closeLabel` for the header close button. Content projects into `[body]`, which scrolls, and buttons into `[actions]`, the footer.
