A small set of mutually exclusive choices presented as one control, such as switching the sprint between board and list views. `qbc-segmented` renders a `role="group"` of buttons, one per `SegmentedOption` (`value`, `label`, optional `title`).

Both `options` and `selected` are required; `ariaLabel` names the group. It is controlled: clicking a different option emits `selectedChange`, and the selected button is marked with `aria-pressed="true"`.
