using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class SprintExecutionAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_017_Display_the_active_sprint()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var done = await Given.AddReadyStoryAsync(epic.Id, "Create a weekly delivery checklist", 2, assistant.Id);
        var open = await Given.AddReadyStoryAsync(epic.Id, "Capture a client decision", 3, assistant.Id);
        var sprint = await Given.AddSprintAsync("Sprint 14", "Make status effortless.", new DateOnly(2026, 8, 17));
        await Given.PlanAsync(sprint.Id, done.Id);
        await Given.PlanAsync(sprint.Id, open.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(done.Id, BoardStatus.Done);

        var board = await Given.ReadActiveBoardAsync();

        Assert.NotNull(board);
        Assert.Equal(sprint.Id, board.SprintId);
        Assert.Equal("Sprint 14", board.Name);
        Assert.Equal("Make status effortless.", board.Goal);
        Assert.Equal(new DateOnly(2026, 8, 17), board.StartDate);
        Assert.Equal(new DateOnly(2026, 8, 30), board.EndDate);
        Assert.Equal(1, board.DoneCount);
        Assert.Equal(2, board.TotalCount);
        Assert.Equal(50, board.CompletionPercentage);
    }

    [Fact]
    public async Task L2_017_Calculate_progress()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var sprint = await Given.AddSprintAsync();
        var stories = new List<StoryDto>();
        foreach (var index in Enumerable.Range(1, 3))
        {
            var story = await Given.AddReadyStoryAsync(epic.Id, $"Deliver increment {index}", 3);
            await Given.PlanAsync(sprint.Id, story.Id);
            stories.Add(story);
        }

        await Given.StartAsync(sprint.Id);
        Assert.Equal(0, (await Given.ReadActiveBoardAsync())!.CompletionPercentage);

        // One of three rounds to a whole percentage.
        await Given.MoveAsync(stories[0].Id, BoardStatus.Done);
        Assert.Equal(33, (await Given.ReadActiveBoardAsync())!.CompletionPercentage);

        await Given.MoveAsync(stories[1].Id, BoardStatus.Done);
        Assert.Equal(67, (await Given.ReadActiveBoardAsync())!.CompletionPercentage);

        await Given.MoveAsync(stories[2].Id, BoardStatus.Done);
        var complete = await Given.ReadActiveBoardAsync();
        Assert.Equal(100, complete!.CompletionPercentage);
        Assert.Equal(complete.TotalCount, complete.DoneCount);

        // Moving work back moves the percentage back with it.
        await Given.MoveAsync(stories[2].Id, BoardStatus.InProgress);
        Assert.Equal(67, (await Given.ReadActiveBoardAsync())!.CompletionPercentage);
    }

    [Fact]
    public async Task L2_017_Display_no_active_sprint_state()
    {
        await Given.AddSprintAsync();

        var response = await Client.GetAsync("/api/sprints/active/board");

        // Nothing is running, and the resource says so rather than inventing a sprint.
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var workspace = await Client.GetFromJsonAsync<WorkspaceBootstrapDto>("/api/workspace?route=board", Workspace.Json);
        Assert.NotNull(workspace);
        Assert.False(workspace.HasActiveSprint);
    }

    [Fact]
    public async Task L2_018_Render_board_stories()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var withTasks = await Given.AddReadyStoryAsync(
            epic.Id,
            "Publish an engagement health summary",
            5,
            assistant.Id,
            [
                new StoryTaskRequest(null, "Draft the summary", true, assistant.Id),
                new StoryTaskRequest(null, "Validate the status", false, assistant.Id)
            ]);
        var withoutTasks = await Given.AddReadyStoryAsync(epic.Id, "Capture a client decision", 3);
        var archived = await Given.AddReadyStoryAsync(epic.Id, "Retire the worksheet", 1);
        var sprint = await Given.AddSprintAsync();
        foreach (var story in new[] { withTasks, withoutTasks, archived })
        {
            await Given.PlanAsync(sprint.Id, story.Id);
        }

        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(withTasks.Id, BoardStatus.InProgress);
        await Given.ArchiveAsync(archived.Id);

        var board = await Given.ReadActiveBoardAsync();

        Assert.NotNull(board);
        // Each non-archived sprint story appears exactly once, in the state it is in.
        Assert.Equal(2, board.Stories.Count);
        Assert.DoesNotContain(board.Stories, card => card.StoryId == archived.Id);

        var card = Assert.Single(board.Stories, item => item.StoryId == withTasks.Id);
        Assert.Equal("QBC-101", card.Key);
        Assert.Equal("Publish an engagement health summary", card.Title);
        Assert.Equal("Client delivery portal", card.EpicName);
        Assert.Equal(5, card.Points);
        Assert.Equal("Maya Chen", card.AssistantName);
        Assert.Equal(1, card.CompletedTasks);
        Assert.Equal(2, card.TotalTasks);
        Assert.Equal(BoardStatus.InProgress, card.BoardStatus);

        var plain = Assert.Single(board.Stories, item => item.StoryId == withoutTasks.Id);
        Assert.Equal(0, plain.TotalTasks);
        Assert.Equal(BoardStatus.ToDo, plain.BoardStatus);
    }

    [Fact]
    public async Task L2_019_Move_a_story_with_controls()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);

        var response = await Client.PostAsJsonAsync(
            $"/api/stories/{story.Id}/move",
            new MoveStoryRequest(BoardStatus.InProgress));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(BoardStatus.InProgress, (await Given.ReadStoryAsync(story.Id)).BoardStatus);

        // Every valid state is reachable, forwards and back again.
        foreach (var status in new[] { BoardStatus.Done, BoardStatus.InProgress, BoardStatus.ToDo })
        {
            await Given.MoveAsync(story.Id, status);
            Assert.Equal(status, (await Given.ReadStoryAsync(story.Id)).BoardStatus);
            Assert.Equal(status, Assert.Single((await Given.ReadActiveBoardAsync())!.Stories).BoardStatus);
        }
    }

    [Fact]
    public async Task L2_019_Reject_movement_outside_the_active_sprint()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var unscheduled = await Given.AddReadyStoryAsync(epic.Id, "Unscheduled work");
        var planned = await Given.AddReadyStoryAsync(epic.Id, "Planned work");
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, planned.Id);

        // A story in no sprint at all.
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{unscheduled.Id}/move", new MoveStoryRequest(BoardStatus.Done)),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(BoardStatus.ToDo, (await Given.ReadStoryAsync(unscheduled.Id)).BoardStatus);

        // A story in a sprint that has not started.
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{planned.Id}/move", new MoveStoryRequest(BoardStatus.Done)),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(BoardStatus.ToDo, (await Given.ReadStoryAsync(planned.Id)).BoardStatus);

        // A story kept in a sprint that has finished.
        var (_, history) = await Given.AddCompletedSprintHistoryAsync(epic.Id);
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{history.Id}/move", new MoveStoryRequest(BoardStatus.ToDo)),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(BoardStatus.Done, (await Given.ReadStoryAsync(history.Id)).BoardStatus);
    }

    [Fact]
    public async Task L2_020_Complete_a_sprint_with_mixed_work()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var finished = await Given.AddReadyStoryAsync(epic.Id, "Create a weekly delivery checklist", 2);
        var started = await Given.AddReadyStoryAsync(epic.Id, "Publish an engagement health summary", 5);
        var untouched = await Given.AddReadyStoryAsync(epic.Id, "Capture a client decision", 3);
        var sprint = await Given.AddSprintAsync();
        foreach (var story in new[] { finished, started, untouched })
        {
            await Given.PlanAsync(sprint.Id, story.Id);
        }

        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(finished.Id, BoardStatus.Done);
        await Given.MoveAsync(started.Id, BoardStatus.InProgress);

        var response = await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/complete", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // The finished story stays with the sprint that delivered it.
        var kept = await Given.ReadStoryAsync(finished.Id);
        Assert.Equal(sprint.Id, kept.SprintId);
        Assert.Equal(SprintStatus.Completed, kept.SprintStatus);
        Assert.Equal(BoardStatus.Done, kept.BoardStatus);
        Assert.Equal(finished.Key, Assert.Single((await Given.ReadSprintAsync(sprint.Id)).StoryKeys));

        // The unfinished work returns to the backlog, Ready and at the start of the flow.
        foreach (var story in new[] { started, untouched })
        {
            var returned = await Given.ReadStoryAsync(story.Id);
            Assert.Null(returned.SprintId);
            Assert.True(returned.IsReady);
            Assert.Equal(StoryLifecycle.Active, returned.Lifecycle);
            Assert.Equal(BoardStatus.ToDo, returned.BoardStatus);
        }
    }

    [Fact]
    public async Task L2_020_Review_completed_membership()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var (sprint, story) = await Given.AddCompletedSprintHistoryAsync(epic.Id);

        // The membership is still there to be read back.
        var history = await Given.ReadSprintAsync(sprint.Id);
        Assert.Equal(SprintStatus.Completed, history.Status);
        Assert.Equal(1, history.StoryCount);
        Assert.Equal(story.Key, Assert.Single(history.StoryKeys));

        // And the story it holds cannot be planned into another sprint.
        var next = await Given.AddSprintAsync("Sprint 14", "The next commitment.", new DateOnly(2026, 8, 17));
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{next.Id}/stories/{story.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(sprint.Id, (await Given.ReadStoryAsync(story.Id)).SprintId);

        // Nor can the completed sprint take on new work.
        var other = await Given.AddReadyStoryAsync(epic.Id, "Capture a client decision", 3);
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{other.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(1, (await Given.ReadSprintAsync(sprint.Id)).StoryCount);
    }
}
