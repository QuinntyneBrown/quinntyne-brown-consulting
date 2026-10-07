Where work is shaped before it reaches a sprint. Two screens of the app share this vocabulary — `features/backlog/backlog-page.component.html` and `features/hierarchy/hierarchy-page.component.html`:

- **Backlog list** — a toolbar of `qbc-text-input` (search, `icon="search"`, `labelHidden`) and `qbc-select` filters with `ariaLabel`s, then one **`qbc-data-row`** per story inside a bordered list. Each row projects its cells by slot: `[state]` (a `qbc-status-pill`, plus a `qbc-tag` for priority), `[estimate]` (`qbc-points`), `[owner]`, `[sprint]` (a small `qbc-select` that is disabled until the story is ready) and `[actions]` (quiet small buttons — _Groom_, _Mark unready_, _Open_).
- **Initiatives** — one **`qbc-initiative-card`** per strategic outcome, with its roll-up in `summary`, actions in `[actions]` and its **`qbc-epic-row`**s as default content. Epic rows show a story count and a mini progress bar.
- **Empty states** — a filtered list with no matches, or a workspace with no initiatives, renders **`qbc-empty-state`** with a single next step.

Errors from the service render above the list as `qbc-form-error`; the first load shows `qbc-loading-state`.
