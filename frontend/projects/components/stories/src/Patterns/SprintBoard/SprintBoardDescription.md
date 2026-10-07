The active sprint, as `projects/qbc-workboard/src/app/features/board/board-page.component.html` renders it:

- **`qbc-page-header`** — "Sprint board" with a secondary _Manage sprints_ action.
- **`qbc-sprint-hero`** — the sprint name in the eyebrow, the goal, the dates, and progress computed from `complete` / `total`. Its `[actions]` slot holds the quiet _Complete sprint_ button.
- **Three `qbc-board-column`s** — To do, In progress, Done — in a three-column grid that stacks below 1000px. Each column shows its `count`, and `empty` renders the "No stories here" placeholder.
- **`qbc-story-card`** per story — key, points, title, epic and task progress in `context`, and the owner's avatar. Cards are `draggableCard` for pointer users, and their `[actions]` slot carries ← / Edit / → buttons so every move also works from the keyboard and on touch. Give the arrow buttons a specific `ariaLabel` ("Move … forward").

When there is no active sprint, the hero and columns are replaced by a `qbc-empty-state` that leads to sprint management.
