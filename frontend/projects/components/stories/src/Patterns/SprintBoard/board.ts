/**
 * The board page body shared by the sprint-board stories. `.board` mirrors
 * `board-page.component.scss` in the app: three columns, stacked below 1000px.
 */
export const boardStyles = [
  `
  .board {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 20px;
  }
  @media (max-width: 1000px) {
    .board {
      grid-template-columns: 1fr;
    }
  }
  `,
];

export const boardPage = `
      <qbc-page content>
        <qbc-page-header title="Sprint board" description="A quiet view of the team’s current commitment."
          ><qbc-button actions variant="secondary">Manage sprints</qbc-button></qbc-page-header
        >
        <qbc-sprint-hero
          eyebrow="Current sprint · Sprint 14"
          goal="Groom and plan from the backlog without leaving the page"
          dates="Sep 28, 2026 – Oct 11, 2026"
          [complete]="2"
          [total]="5"
        >
          <qbc-button actions variant="quiet">Complete sprint</qbc-button>
        </qbc-sprint-hero>
        <div class="board">
          @for (column of columns; track column.label) {
            <qbc-board-column
              [label]="column.label"
              [count]="column.stories.length"
              [empty]="column.stories.length === 0"
            >
              @for (story of column.stories; track story.key) {
                <qbc-story-card
                  draggableCard
                  [storyKey]="story.key"
                  [title]="story.title"
                  [context]="story.context"
                  [points]="story.points"
                  [owner]="story.owner"
                >
                  <qbc-button
                    actions
                    variant="quiet"
                    [disabled]="column.first"
                    [ariaLabel]="'Move ' + story.title + ' backward'"
                    >←</qbc-button
                  >
                  <qbc-button
                    actions
                    variant="quiet"
                    [disabled]="column.last"
                    [ariaLabel]="'Move ' + story.title + ' forward'"
                    >→</qbc-button
                  >
                </qbc-story-card>
              }
            </qbc-board-column>
          }
        </div>
      </qbc-page>
`;
