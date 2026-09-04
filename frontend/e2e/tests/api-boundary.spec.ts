import { test } from '../fixtures/workboard.fixture';
import { slowReads } from '../mocks/workspace-scenarios';
import { AssistantsPage } from '../pages/assistants.page';
import { BacklogPage } from '../pages/backlog.page';
import { StoryEditorPage } from '../pages/story-editor.page';
import { WorkboardPage } from '../pages/workboard.page';

test.describe(slowReads.name, () => {
  test.use({ seed: slowReads });

  test('L2-034 · Load a feature', async ({ page }) => {
    const workboard = new WorkboardPage(page);
    const assistants = new AssistantsPage(page);
    // Activating the route reads the directory from the backend, and the wait is represented
    // on screen until the answer arrives.
    await page.goto('/assistants');
    await assistants.expectLoadingState();
    await assistants.expectAssistant('Maya Chen');
    await workboard.expectNoErrorPresented();
  });
});

test('L2-034 · Submit a mutation', async ({ page }) => {
  const workboard = new WorkboardPage(page);
  const editor = new StoryEditorPage(page);
  const backlog = new BacklogPage(page);
  await workboard.navigateTo('backlog');

  // The browser sends a title and an epic; the key, the lifecycle, and the readiness all come
  // back from the server, and the UI shows what the server decided rather than what it sent.
  await editor.createStory({ title: 'Draft a delivery risk register', epic: 'Delivery playbook' });
  await backlog.expectRowDetail('Draft a delivery risk register', {
    key: 'QBC-107',
    initiative: 'Client delivery excellence',
    epic: 'Delivery playbook',
    state: 'draft',
    points: 'Not estimated',
    sprint: 'Backlog',
  });
});

test('L2-034 · Handle API failure', async ({ page }) => {
  await new WorkboardPage(page).navigateTo('assistants');
  await new AssistantsPage(page).expectSaveFailureFeedback('Unavailable assistant');
});
