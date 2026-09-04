import { test } from '../fixtures/workboard.fixture';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { BoardPage } from '../pages/board.page';
import { HierarchyPage } from '../pages/hierarchy.page';
import { EpicSummaryPage } from '../pages/epic-summary.page';
import { InitiativeBriefPage } from '../pages/initiative-brief.page';
import { SprintManagerPage } from '../pages/sprint-manager.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

const INITIATIVE = 'Verified delivery outcome';
const EPIC = 'Verified delivery capability';
const ASSISTANT = 'Jordan Adeyemi';
const STORY = 'Deliver a verified increment';
const SPRINT = 'Sprint 16';

/**
 * The whole product in one pass, from an empty outcome to a completed sprint. Every requirement
 * has its own scenario test; this one exists because L2-038 asks the suite to exercise the
 * critical workflows together, and it is the subset the other browser engines run.
 */
test('L2-038 · Exercise critical product workflows', { tag: '@smoke' }, async ({ page }) => {
  test.slow();
  const workboard = new WorkboardPage(page);
  const hierarchy = new HierarchyPage(page);
  const assistants = new AssistantsPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  const board = new BoardPage(page);
  const sprints = new SprintManagerPage(page);
  const initiativeEditor = new InitiativeBriefPage(page);
  const epicEditor = new EpicSummaryPage(page);

  // Initiative and epic creation.
  await workboard.navigateTo('initiatives');
  await initiativeEditor.startNew();
  await initiativeEditor.writeInitiative(
    INITIATIVE,
    'An outcome created through the acceptance boundary.',
  );
  await hierarchy.returnToHierarchy();
  await epicEditor.startNewUnder(INITIATIVE);
  await epicEditor.writeEpic(EPIC, 'A coherent slice of delivery capability.');
  await hierarchy.returnToHierarchy();

  // Assistant and task assignment.
  await workboard.usePrimaryNavigation('Assistants');
  await assistants.createAssistant({ name: ASSISTANT, role: 'Delivery assurance assistant' });
  await editor.createStory(
    {
      title: STORY,
      epic: EPIC,
      owner: ASSISTANT,
      description: 'As a consultant, I want a verified workflow so that delivery stays clear.',
      acceptanceCriteria: 'The increment is planned, moved, and completed through the product.',
      points: '3',
    },
    { title: `Implement ${STORY}`, assignee: ASSISTANT },
  );

  // Persistence after reload, then archive and restore.
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.expectStory(STORY);
  await backlog.reloadAndExpectStory(STORY);
  await backlog.openStory(STORY);
  await editor.archiveOpenStory();
  await backlog.expectState(STORY, 'archived');
  await backlog.openStory(STORY);
  await editor.restoreOpenStory();
  await backlog.expectState(STORY, 'draft');

  // Draft-story grooming.
  await backlog.openStory(STORY);
  await editor.fill({
    title: STORY,
    epic: EPIC,
    owner: ASSISTANT,
    description: 'As a consultant, I want a verified workflow so that delivery stays clear.',
    acceptanceCriteria: 'The increment is planned, moved, and completed through the product.',
    points: '3',
  });
  await editor.save();
  await backlog.groomStory(STORY);

  // Guarded deletion.
  await workboard.usePrimaryNavigation('Assistants');
  await assistants.expectGuardedDeletion(ASSISTANT, STORY);

  // Sprint planning.
  await workboard.usePrimaryNavigation('Board');
  await board.completeActiveSprint();
  await sprints.open();
  await sprints.createSprint(SPRINT, 'Deliver the verified acceptance increment.', '2026-10-05');
  await sprints.close();
  await workboard.usePrimaryNavigation('Backlog');
  await backlog.assignStory(STORY, SPRINT);

  // Board movement and sprint completion.
  await workboard.usePrimaryNavigation('Board');
  await sprints.open();
  await sprints.startSprint(SPRINT);
  await sprints.close();
  await board.moveStoryForward(STORY);
  await board.moveStoryForward(STORY);
  await board.reloadAndExpectStoryInColumn(STORY, 'Done');
  await board.completeActiveSprint();

  // API failure feedback.
  await workboard.usePrimaryNavigation('Assistants');
  await assistants.expectSaveFailureFeedback('Unavailable assistant');
});
