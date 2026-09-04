using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class BacklogAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_011_View_backlog_context()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var planned = await Given.AddReadyStoryAsync(epic.Id, "Publish an engagement health summary", 5, assistant.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, planned.Id);
        var draft = await Given.AddDraftStoryAsync(epic.Id, "Share milestone notes");
        var archived = await Given.AddDraftStoryAsync(epic.Id, "Retire the legacy worksheet");
        await Given.ArchiveAsync(archived.Id);

        var backlog = await Given.ReadBacklogAsync();

        // Every story is offered, whatever state it is in, with the context needed to place it.
        Assert.Equal(3, backlog.Count);

        var scheduled = Assert.Single(backlog, story => story.Id == planned.Id);
        Assert.Equal("QBC-101", scheduled.Key);
        Assert.Equal("Publish an engagement health summary", scheduled.Title);
        Assert.Equal("Client delivery excellence", scheduled.InitiativeName);
        Assert.Equal("Client delivery portal", scheduled.EpicName);
        Assert.Equal(StoryLifecycle.Active, scheduled.Lifecycle);
        Assert.True(scheduled.IsReady);
        Assert.Equal(5, scheduled.Points);
        Assert.Equal("Maya Chen", scheduled.AssistantName);
        Assert.Equal(sprint.Id, scheduled.SprintId);
        Assert.Equal("Sprint 14", scheduled.SprintName);
        Assert.Equal(SprintStatus.Planned, scheduled.SprintStatus);

        var unscheduled = Assert.Single(backlog, story => story.Id == draft.Id);
        Assert.Equal(StoryLifecycle.Draft, unscheduled.Lifecycle);
        Assert.False(unscheduled.IsReady);
        Assert.Null(unscheduled.Points);
        Assert.Null(unscheduled.SprintId);

        Assert.Equal(StoryLifecycle.Archived, Assert.Single(backlog, story => story.Id == archived.Id).Lifecycle);
    }

    [Fact]
    public async Task L2_012_Complete_grooming()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);

        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var groomed = await Given.ReadStoryAsync(story.Id);
        Assert.True(groomed.IsReady);
        Assert.Equal(StoryLifecycle.Active, groomed.Lifecycle);

        // Readiness is what makes the story eligible for a sprint.
        var sprint = await Given.AddSprintAsync();
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}", new { })).StatusCode);
    }

    [Fact]
    public async Task L2_012_Server_enforced_readiness()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddDraftStoryAsync(epic.Id);

        // A client asking the API directly is held to the same grooming rules as the workspace.
        var response = await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { });

        await ExpectInvalidFieldsAsync(response, "description", "acceptanceCriteria", "points");
        var unchanged = await Given.ReadStoryAsync(story.Id);
        Assert.False(unchanged.IsReady);
        Assert.Equal(StoryLifecycle.Draft, unchanged.Lifecycle);

        // Each missing field is reported until it is supplied.
        await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(epic.Id, story.Title, "A user story.", string.Empty, null, null, []));
        await ExpectInvalidFieldsAsync(
            await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { }),
            "acceptanceCriteria",
            "points");

        await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(epic.Id, story.Title, "A user story.", "Acceptance criteria.", 5, null, []));
        Assert.Equal(
            HttpStatusCode.OK,
            (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { })).StatusCode);

        // An archived story is refused whatever it carries.
        await Given.ArchiveAsync(story.Id);
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { }),
            HttpStatusCode.Conflict,
            "conflict");
        Assert.False((await Given.ReadStoryAsync(story.Id)).IsReady);
    }
}
