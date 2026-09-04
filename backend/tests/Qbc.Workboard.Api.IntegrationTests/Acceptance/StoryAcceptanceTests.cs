using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class StoryAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_005_Save_a_new_draft()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();

        var response = await Client.PostAsJsonAsync(
            "/api/stories",
            new StoryRequest(epic.Id, "Draft a delivery risk register", string.Empty, string.Empty, null, null, []));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var story = await response.Content.ReadFromJsonAsync<StoryDto>(Workspace.Json);
        Assert.NotNull(story);
        Assert.NotEqual(Guid.Empty, story.Id);
        Assert.Equal("QBC-101", story.Key);
        Assert.Equal(StoryLifecycle.Draft, story.Lifecycle);
        Assert.False(story.IsReady);

        // The next story takes the next key in the sequence, and no key is reused.
        var second = await Given.AddDraftStoryAsync(epic.Id, "Draft an escalation path");
        Assert.Equal("QBC-102", second.Key);
        Assert.NotEqual(story.Id, second.Id);

        var persisted = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(StoryLifecycle.Draft, persisted.Lifecycle);
        Assert.False(persisted.IsReady);
    }

    [Fact]
    public async Task L2_005_View_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            assistantId: assistant.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", true, assistant.Id)]);

        var response = await Client.GetAsync($"/api/stories/{story.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var read = await response.Content.ReadFromJsonAsync<StoryDto>(Workspace.Json);
        Assert.NotNull(read);
        Assert.Equal("QBC-101", read.Key);
        Assert.Equal(epic.Id, read.EpicId);
        Assert.Equal("Client delivery portal", read.EpicName);
        Assert.Equal("Client delivery excellence", read.InitiativeName);
        Assert.Equal("Publish an engagement health summary", read.Title);
        Assert.Equal("As a client, I want a health summary so that I can steer the engagement.", read.Description);
        Assert.Equal("Status, risks, and the next milestone are visible in one place.", read.AcceptanceCriteria);
        Assert.Equal(5, read.Points);
        Assert.Equal(assistant.Id, read.AssistantId);
        Assert.Equal("Maya Chen", read.AssistantName);
        Assert.Equal(StoryLifecycle.Draft, read.Lifecycle);
        Assert.False(read.IsReady);
        Assert.Null(read.SprintId);
        Assert.Equal(BoardStatus.ToDo, read.BoardStatus);

        var task = Assert.Single(read.Tasks);
        Assert.Equal("Draft the summary", task.Title);
        Assert.True(task.IsComplete);
        Assert.Equal("Maya Chen", task.AssistantName);
    }

    [Fact]
    public async Task L2_005_Update_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var other = await Given.AddEpicAsync(
            (await Given.ReadHierarchyAsync()).Initiatives.Single().Id,
            "Delivery playbook",
            "Standardize the practices.");
        var assistant = await Given.AddAssistantAsync("Noah Williams", "Software development assistant");
        var story = await Given.AddDraftStoryAsync(epic.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(
                other.Id,
                "Create a responsible AI risk canvas",
                "As an AI lead, I want a risk canvas so that decisions are explicit.",
                "The canvas covers data, model, human, and operational risks.",
                8,
                assistant.Id,
                []));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(other.Id, updated.EpicId);
        Assert.Equal("Delivery playbook", updated.EpicName);
        Assert.Equal("Create a responsible AI risk canvas", updated.Title);
        Assert.Equal(8, updated.Points);
        Assert.Equal("Noah Williams", updated.AssistantName);

        // Every view of the story reports the change, not only the one that made it.
        var backlogEntry = Assert.Single(await Given.ReadBacklogAsync());
        Assert.Equal("Create a responsible AI risk canvas", backlogEntry.Title);
        Assert.Equal(8, backlogEntry.Points);
    }

    [Fact]
    public async Task L2_005_Validate_story_points()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();

        foreach (var accepted in new[] { 1, 2, 3, 5, 8, 13 })
        {
            var story = await Given.AddGroomableStoryAsync(epic.Id, $"Estimated at {accepted}", accepted);
            Assert.Equal(accepted, story.Points);
        }

        foreach (var rejected in new[] { 0, 4, 6, 7, 21, -1 })
        {
            var response = await Client.PostAsJsonAsync(
                "/api/stories",
                new StoryRequest(epic.Id, "Rejected estimate", string.Empty, string.Empty, rejected, null, []));
            await ExpectInvalidFieldsAsync(response, "points");
        }

        Assert.Equal(6, (await Given.ReadBacklogAsync()).Count);
    }

    [Fact]
    public async Task L2_006_Draft_behavior()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();

        Assert.Equal(StoryLifecycle.Draft, story.Lifecycle);
        Assert.False(story.IsReady);

        var response = await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}", new { });

        await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        var unchanged = await Given.ReadStoryAsync(story.Id);
        Assert.Null(unchanged.SprintId);
        Assert.Equal(StoryLifecycle.Draft, unchanged.Lifecycle);
    }

    [Fact]
    public async Task L2_006_Mark_a_story_Ready()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var groomed = await response.Content.ReadFromJsonAsync<StoryDto>(Workspace.Json);
        Assert.NotNull(groomed);
        Assert.Equal(StoryLifecycle.Active, groomed.Lifecycle);
        Assert.True(groomed.IsReady);

        var persisted = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(StoryLifecycle.Active, persisted.Lifecycle);
        Assert.True(persisted.IsReady);
    }

    [Fact]
    public async Task L2_006_Mark_a_story_unready()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/mark-unready", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var unready = await Given.ReadStoryAsync(story.Id);
        Assert.False(unready.IsReady);
        // Readiness is independent of lifecycle: the story stays Active.
        Assert.Equal(StoryLifecycle.Active, unready.Lifecycle);
    }

    [Fact]
    public async Task L2_006_Protect_planned_readiness()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var planned = await Given.AddSprintAsync("Sprint 15", "Validate the next increment.");
        await Given.PlanAsync(planned.Id, story.Id);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/mark-unready", new { });

        var problem = await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Contains("sprint", problem.GetProperty("detail").GetString(), StringComparison.OrdinalIgnoreCase);
        Assert.True((await Given.ReadStoryAsync(story.Id)).IsReady);

        // The same story becomes unready once it leaves the sprint.
        await Client.DeleteAsync($"/api/sprints/{planned.Id}/stories/{story.Id}");
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/mark-unready", new { })).StatusCode);
    }

    [Fact]
    public async Task L2_007_Add_a_task()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();

        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            tasks: [new StoryTaskRequest(null, "Collect the sprint signals", false, assistant.Id)]);

        var task = Assert.Single((await Given.ReadStoryAsync(story.Id)).Tasks);
        Assert.NotEqual(Guid.Empty, task.Id);
        Assert.Equal("Collect the sprint signals", task.Title);
        Assert.Equal(assistant.Id, task.AssistantId);
        Assert.False(task.IsComplete);
    }

    [Fact]
    public async Task L2_007_Update_a_task()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var first = await Given.AddAssistantAsync();
        var second = await Given.AddAssistantAsync("Noah Williams", "Software development assistant");
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", false, first.Id)]);
        var task = Assert.Single(story.Tasks);

        var response = await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(
                story.EpicId,
                story.Title,
                story.Description,
                story.AcceptanceCriteria,
                story.Points,
                story.AssistantId,
                [new StoryTaskRequest(task.Id, "Confirm the summary with delivery", true, second.Id)]));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = Assert.Single((await Given.ReadStoryAsync(story.Id)).Tasks);
        Assert.Equal("Confirm the summary with delivery", updated.Title);
        Assert.True(updated.IsComplete);
        Assert.Equal(second.Id, updated.AssistantId);
        Assert.Equal("Noah Williams", updated.AssistantName);
    }

    [Fact]
    public async Task L2_007_Delete_a_task()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            tasks:
            [
                new StoryTaskRequest(null, "Draft the summary", false, null),
                new StoryTaskRequest(null, "Validate the status", false, null)
            ]);
        var kept = story.Tasks.Single(item => item.Title == "Validate the status");

        var response = await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(
                story.EpicId,
                story.Title,
                story.Description,
                story.AcceptanceCriteria,
                story.Points,
                story.AssistantId,
                [new StoryTaskRequest(kept.Id, kept.Title, kept.IsComplete, kept.AssistantId)]));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // The task is gone and its story is not.
        var persisted = await Given.ReadStoryAsync(story.Id);
        Assert.Equal("Validate the status", Assert.Single(persisted.Tasks).Title);
    }

    [Fact]
    public async Task L2_007_Reject_a_blank_task()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();

        var created = await Client.PostAsJsonAsync(
            "/api/stories",
            new StoryRequest(
                epic.Id,
                "Prepare a delivery retrospective",
                string.Empty,
                string.Empty,
                null,
                null,
                [new StoryTaskRequest(null, "   ", false, null)]));

        await ExpectInvalidFieldsAsync(created, "tasks");
        Assert.Empty(await Given.ReadBacklogAsync());

        // The same rule applies when an existing story's task is emptied.
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", false, null)]);
        var task = Assert.Single(story.Tasks);
        var updated = await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(
                story.EpicId,
                story.Title,
                story.Description,
                story.AcceptanceCriteria,
                story.Points,
                story.AssistantId,
                [new StoryTaskRequest(task.Id, string.Empty, false, null)]));

        await ExpectInvalidFieldsAsync(updated, "tasks");
        Assert.Equal("Draft the summary", Assert.Single((await Given.ReadStoryAsync(story.Id)).Tasks).Title);
    }

    [Fact]
    public async Task L2_008_Archive_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(story.Id, BoardStatus.InProgress);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/archive", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var archived = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(StoryLifecycle.Archived, archived.Lifecycle);
        Assert.False(archived.IsReady);
        Assert.Null(archived.SprintId);
        Assert.Equal(BoardStatus.ToDo, archived.BoardStatus);

        // It stays retrievable, and it leaves the board.
        Assert.Contains(await Given.ReadBacklogAsync(), item => item.Id == story.Id);
        var board = await Given.ReadActiveBoardAsync();
        Assert.NotNull(board);
        Assert.Empty(board.Stories);
    }

    [Fact]
    public async Task L2_008_Restore_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        await Given.ArchiveAsync(story.Id);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/restore", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var restored = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(StoryLifecycle.Draft, restored.Lifecycle);
        Assert.False(restored.IsReady);
        Assert.Null(restored.SprintId);

        // Only an archived story can be restored.
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{story.Id}/restore", new { }),
            HttpStatusCode.Conflict,
            "conflict");
    }

    [Fact]
    public async Task L2_008_Permanently_delete_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", false, null)]);

        var response = await Client.DeleteAsync($"/api/stories/{story.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/stories/{story.Id}")).StatusCode);
        Assert.Empty(await Given.ReadBacklogAsync());

        // The story's tasks went with it, so its epic is empty and can now be deleted.
        Assert.Equal(HttpStatusCode.NoContent, (await Client.DeleteAsync($"/api/epics/{epic.Id}")).StatusCode);
    }

    [Fact]
    public async Task L2_008_Preserve_sprint_history()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var (_, story) = await Given.AddCompletedSprintHistoryAsync(epic.Id);

        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{story.Id}/archive", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/stories/{story.Id}"),
            HttpStatusCode.Conflict,
            "conflict");

        var kept = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(StoryLifecycle.Active, kept.Lifecycle);
        Assert.Equal(SprintStatus.Completed, kept.SprintStatus);
        Assert.Equal(BoardStatus.Done, kept.BoardStatus);
    }
}
