using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class SprintPlanningAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_013_Create_a_sprint()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/sprints",
            new SprintRequest("Sprint 16", "Prove the margin insight increment.", new DateOnly(2026, 10, 5)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var sprint = await response.Content.ReadFromJsonAsync<SprintDto>(Workspace.Json);
        Assert.NotNull(sprint);
        Assert.NotEqual(Guid.Empty, sprint.Id);
        Assert.Equal(SprintStatus.Planned, sprint.Status);
        Assert.Equal(new DateOnly(2026, 10, 5), sprint.StartDate);
        // The inclusive fourteen-day range ends thirteen days after it starts.
        Assert.Equal(new DateOnly(2026, 10, 18), sprint.EndDate);

        var persisted = await Given.ReadSprintAsync(sprint.Id);
        Assert.Equal(SprintStatus.Planned, persisted.Status);
        Assert.Equal(new DateOnly(2026, 10, 18), persisted.EndDate);
    }

    [Fact]
    public async Task L2_013_Reject_an_invalid_sprint()
    {
        await ExpectInvalidFieldsAsync(
            await Client.PostAsJsonAsync("/api/sprints", new SprintRequest("  ", string.Empty, new DateOnly(2026, 10, 5))),
            "name",
            "goal");

        await ExpectInvalidFieldsAsync(
            await Client.PostAsJsonAsync("/api/sprints", new SprintRequest("Sprint 16", "A goal.", default)),
            "startDate");

        await Given.AddSprintAsync("Sprint 16", "The first sprint to use the name.");
        // A name another sprint already uses, whatever its casing.
        await ExpectInvalidFieldsAsync(
            await Client.PostAsJsonAsync("/api/sprints", new SprintRequest("sprint 16", "A goal.", new DateOnly(2026, 10, 5))),
            "name");

        Assert.Single((await Client.GetFromJsonAsync<IReadOnlyList<SprintDto>>("/api/sprints", Workspace.Json))!);
    }

    [Fact]
    public async Task L2_013_Update_a_sprint()
    {
        var sprint = await Given.AddSprintAsync("Sprint 15", "Validate the next increment.", new DateOnly(2026, 8, 31));

        var response = await Client.PutAsJsonAsync(
            $"/api/sprints/{sprint.Id}",
            new SprintRequest("Sprint 15", "Prove the increment end to end.", new DateOnly(2026, 9, 7)));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await Given.ReadSprintAsync(sprint.Id);
        Assert.Equal("Prove the increment end to end.", updated.Goal);
        // Moving the start date moves the derived end date with it.
        Assert.Equal(new DateOnly(2026, 9, 7), updated.StartDate);
        Assert.Equal(new DateOnly(2026, 9, 20), updated.EndDate);
    }

    [Fact]
    public async Task L2_013_Correct_completed_sprint_metadata()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var (sprint, story) = await Given.AddCompletedSprintHistoryAsync(epic.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/sprints/{sprint.Id}",
            new SprintRequest("Sprint 13 — baseline", "Establish a baseline for the account.", sprint.StartDate));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var corrected = await Given.ReadSprintAsync(sprint.Id);
        Assert.Equal("Sprint 13 — baseline", corrected.Name);
        Assert.Equal("Establish a baseline for the account.", corrected.Goal);
        // Its dates, status, and completed membership are history and stay put.
        Assert.Equal(sprint.StartDate, corrected.StartDate);
        Assert.Equal(sprint.EndDate, corrected.EndDate);
        Assert.Equal(SprintStatus.Completed, corrected.Status);
        Assert.Equal(story.Key, Assert.Single(corrected.StoryKeys));

        // A date change is refused rather than quietly ignored.
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync(
                $"/api/sprints/{sprint.Id}",
                new SprintRequest(corrected.Name, corrected.Goal, sprint.StartDate.AddDays(1))),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(sprint.EndDate, (await Given.ReadSprintAsync(sprint.Id)).EndDate);
    }

    [Fact]
    public async Task L2_014_Start_a_sprint()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);

        var response = await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/start", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SprintStatus.Active, (await Given.ReadSprintAsync(sprint.Id)).Status);

        // Its assigned stories are what the board now shows.
        var board = await Given.ReadActiveBoardAsync();
        Assert.NotNull(board);
        Assert.Equal(sprint.Id, board.SprintId);
        Assert.Equal(story.Id, Assert.Single(board.Stories).StoryId);
    }

    [Fact]
    public async Task L2_014_Reject_a_second_active_sprint()
    {
        var running = await Given.AddSprintAsync("Sprint 14", "The commitment already underway.");
        await Given.StartAsync(running.Id);
        var waiting = await Given.AddSprintAsync("Sprint 15", "Validate the next increment.", new DateOnly(2026, 8, 31));

        var response = await Client.PostAsJsonAsync($"/api/sprints/{waiting.Id}/start", new { });

        await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Equal(SprintStatus.Planned, (await Given.ReadSprintAsync(waiting.Id)).Status);
        Assert.Equal(SprintStatus.Active, (await Given.ReadSprintAsync(running.Id)).Status);
    }

    [Fact]
    public async Task L2_014_Complete_an_active_sprint()
    {
        var sprint = await Given.AddSprintAsync();
        await Given.StartAsync(sprint.Id);
        var next = await Given.AddSprintAsync("Sprint 15", "Validate the next increment.", new DateOnly(2026, 8, 31));

        var response = await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/complete", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(SprintStatus.Completed, (await Given.ReadSprintAsync(sprint.Id)).Status);

        // Nothing runs again until a planned sprint is started on purpose.
        Assert.Equal(HttpStatusCode.NoContent, (await Client.GetAsync("/api/sprints/active/board")).StatusCode);
        Assert.Equal(SprintStatus.Planned, (await Given.ReadSprintAsync(next.Id)).Status);
        await Given.StartAsync(next.Id);
        Assert.Equal(SprintStatus.Active, (await Given.ReadSprintAsync(next.Id)).Status);
    }

    [Fact]
    public async Task L2_014_Reject_an_invalid_lifecycle_transition()
    {
        var planned = await Given.AddSprintAsync();

        // Planned sprints cannot be completed without running.
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/sprints/{planned.Id}/complete", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(SprintStatus.Planned, (await Given.ReadSprintAsync(planned.Id)).Status);

        await Given.StartAsync(planned.Id);
        await Given.CompleteAsync(planned.Id);

        // A completed sprint cannot be completed again, nor started again.
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/sprints/{planned.Id}/complete", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/sprints/{planned.Id}/start", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(SprintStatus.Completed, (await Given.ReadSprintAsync(planned.Id)).Status);
    }

    [Fact]
    public async Task L2_015_Plan_a_Ready_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var planned = await Given.AddSprintAsync("Sprint 15", "Validate the next increment.");

        var response = await Client.PutAsJsonAsync($"/api/sprints/{planned.Id}/stories/{story.Id}", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var assigned = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(planned.Id, assigned.SprintId);
        Assert.Equal(SprintStatus.Planned, assigned.SprintStatus);
        // The story arrives at the start of the board's flow.
        Assert.Equal(BoardStatus.ToDo, assigned.BoardStatus);
        Assert.Equal(story.Key, Assert.Single((await Given.ReadSprintAsync(planned.Id)).StoryKeys));

        // An active sprint accepts the same story just as readily.
        var active = await Given.AddSprintAsync("Sprint 14", "The running commitment.", new DateOnly(2026, 9, 14));
        await Given.StartAsync(active.Id);
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync($"/api/sprints/{active.Id}/stories/{story.Id}", new { })).StatusCode);
        Assert.Equal(active.Id, (await Given.ReadStoryAsync(story.Id)).SprintId);
    }

    [Fact]
    public async Task L2_015_Reject_an_ineligible_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var sprint = await Given.AddSprintAsync();

        var draft = await Given.AddGroomableStoryAsync(epic.Id, "A draft story");
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{draft.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Null((await Given.ReadStoryAsync(draft.Id)).SprintId);

        var unready = await Given.AddReadyStoryAsync(epic.Id, "A story made unready");
        await Client.PostAsJsonAsync($"/api/stories/{unready.Id}/mark-unready", new { });
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{unready.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Null((await Given.ReadStoryAsync(unready.Id)).SprintId);

        var archived = await Given.AddReadyStoryAsync(epic.Id, "An archived story");
        await Given.ArchiveAsync(archived.Id);
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{archived.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Null((await Given.ReadStoryAsync(archived.Id)).SprintId);

        var (_, history) = await Given.AddCompletedSprintHistoryAsync(epic.Id);
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{history.Id}", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(history.SprintId, (await Given.ReadStoryAsync(history.Id)).SprintId);
    }

    [Fact]
    public async Task L2_015_Return_planned_work_to_the_backlog()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(story.Id, BoardStatus.InProgress);

        var response = await Client.DeleteAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var returned = await Given.ReadStoryAsync(story.Id);
        Assert.Null(returned.SprintId);
        Assert.Equal(BoardStatus.ToDo, returned.BoardStatus);
        // It is unscheduled work again, and still Ready to be replanned.
        Assert.True(returned.IsReady);
        Assert.Empty((await Given.ReadSprintAsync(sprint.Id)).StoryKeys);
    }

    [Fact]
    public async Task L2_016_Delete_a_planned_sprint()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);

        var response = await Client.DeleteAsync($"/api/sprints/{sprint.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/sprints/{sprint.Id}")).StatusCode);

        // Its stories come back to the backlog, at the start of the flow and still Ready.
        var returned = await Given.ReadStoryAsync(story.Id);
        Assert.Null(returned.SprintId);
        Assert.Equal(BoardStatus.ToDo, returned.BoardStatus);
        Assert.True(returned.IsReady);
    }

    [Fact]
    public async Task L2_016_Protect_active_and_completed_sprints()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id);
        var active = await Given.AddSprintAsync();
        await Given.PlanAsync(active.Id, story.Id);
        await Given.StartAsync(active.Id);

        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/sprints/{active.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        var stillRunning = await Given.ReadSprintAsync(active.Id);
        Assert.Equal(SprintStatus.Active, stillRunning.Status);
        Assert.Equal(story.Key, Assert.Single(stillRunning.StoryKeys));

        await Given.MoveAsync(story.Id, BoardStatus.Done);
        await Given.CompleteAsync(active.Id);

        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/sprints/{active.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        var history = await Given.ReadSprintAsync(active.Id);
        Assert.Equal(SprintStatus.Completed, history.Status);
        Assert.Equal(story.Key, Assert.Single(history.StoryKeys));
    }
}
