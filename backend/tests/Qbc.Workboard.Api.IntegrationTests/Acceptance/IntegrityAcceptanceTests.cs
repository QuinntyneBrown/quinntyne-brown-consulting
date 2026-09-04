using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class IntegrityAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_022_Reject_an_unknown_parent_or_assignee()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var missing = Guid.NewGuid();

        await ExpectProblemAsync(
            await Client.PostAsJsonAsync("/api/epics", new EpicRequest(missing, "An orphan epic", "No parent.")),
            HttpStatusCode.NotFound,
            "not-found");
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync(
                "/api/stories",
                new StoryRequest(missing, "An orphan story", string.Empty, string.Empty, null, null, [])),
            HttpStatusCode.NotFound,
            "not-found");
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync(
                "/api/stories",
                new StoryRequest(epic.Id, "An unassignable story", string.Empty, string.Empty, null, missing, [])),
            HttpStatusCode.NotFound,
            "not-found");
        await ExpectProblemAsync(
            await Client.PutAsJsonAsync($"/api/sprints/{missing}/stories/{missing}", new { }),
            HttpStatusCode.NotFound,
            "not-found");

        // Nothing was written on the way to any of those refusals: not the records, and not the
        // story key sequence, which the very next accepted story proves is still at its first key.
        Assert.Empty(await Given.ReadBacklogAsync());
        Assert.Equal("QBC-101", (await Given.AddDraftStoryAsync(epic.Id)).Key);
    }

    [Fact]
    public async Task L2_022_Apply_a_multi_record_transition_atomically()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var finished = await Given.AddReadyStoryAsync(epic.Id, "Create a weekly delivery checklist", 2);
        var open = await Given.AddReadyStoryAsync(epic.Id, "Capture a client decision", 3);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, finished.Id);
        await Given.PlanAsync(sprint.Id, open.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(finished.Id, BoardStatus.Done);

        // Deleting a running sprint would return both of its stories to the backlog. The operation
        // is refused as a whole, so neither story moves and the sprint keeps its membership.
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/sprints/{sprint.Id}"),
            HttpStatusCode.Conflict,
            "conflict");

        var running = await Given.ReadSprintAsync(sprint.Id);
        Assert.Equal(SprintStatus.Active, running.Status);
        Assert.Equal(2, running.StoryCount);
        Assert.Equal(sprint.Id, (await Given.ReadStoryAsync(finished.Id)).SprintId);
        Assert.Equal(BoardStatus.Done, (await Given.ReadStoryAsync(finished.Id)).BoardStatus);
        Assert.Equal(sprint.Id, (await Given.ReadStoryAsync(open.Id)).SprintId);
        Assert.Equal(BoardStatus.ToDo, (await Given.ReadStoryAsync(open.Id)).BoardStatus);

        // The same holds for completing a sprint that is not the one running.
        var other = await Given.AddSprintAsync("Sprint 15", "The next commitment.", new DateOnly(2026, 8, 31));
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/sprints/{other.Id}/complete", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.Equal(SprintStatus.Planned, (await Given.ReadSprintAsync(other.Id)).Status);
        Assert.Equal(2, (await Given.ReadSprintAsync(sprint.Id)).StoryCount);
    }

    [Fact]
    public async Task L2_022_Enforce_deletion_rules_at_the_backend()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddReadyStoryAsync(epic.Id, assistantId: assistant.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);

        // Each guard the workspace shows is enforced here, for any client that asks directly.
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/initiatives/{initiative.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/epics/{epic.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/assistants/{assistant.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/sprints/{sprint.Id}"),
            HttpStatusCode.Conflict,
            "conflict");

        // Everything the refusals protected is still there.
        Assert.Single((await Given.ReadHierarchyAsync()).Initiatives);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/epics/{epic.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/assistants/{assistant.Id}")).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/sprints/{sprint.Id}")).StatusCode);
    }
}
