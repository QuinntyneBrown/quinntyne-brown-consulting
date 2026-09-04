using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class PersistenceAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_021_Persist_across_browser_sessions()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddReadyStoryAsync(
            epic.Id,
            assistantId: assistant.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", true, assistant.Id)]);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(story.Id, BoardStatus.InProgress);

        // A second client holds nothing of its own, so everything it reads came from the backend.
        using var another = Factory.CreateUnlockedClient();
        var elsewhere = new Workspace(another);

        var read = await elsewhere.ReadStoryAsync(story.Id);
        Assert.Equal("QBC-101", read.Key);
        Assert.Equal(BoardStatus.InProgress, read.BoardStatus);
        Assert.True(read.IsReady);
        Assert.Equal("Maya Chen", read.AssistantName);
        Assert.True(Assert.Single(read.Tasks).IsComplete);

        var board = await elsewhere.ReadActiveBoardAsync();
        Assert.NotNull(board);
        Assert.Equal(sprint.Id, board.SprintId);
        Assert.Equal(story.Id, Assert.Single(board.Stories).StoryId);
        Assert.Equal(1, Assert.Single((await elsewhere.ReadHierarchyAsync()).Initiatives).StoryCount);
    }

    [Fact]
    public async Task L2_021_Persist_across_backend_restart()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddReadyStoryAsync(
            epic.Id,
            assistantId: assistant.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", false, assistant.Id)]);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, story.Id);
        await Given.StartAsync(sprint.Id);

        // A second application over the same store, as a redeployment or a process restart would be.
        using var restarted = Factory.Restart();
        using var client = restarted.CreateUnlockedClient();
        var afterwards = new Workspace(client);

        var read = await afterwards.ReadStoryAsync(story.Id);
        Assert.Equal("QBC-101", read.Key);
        Assert.Equal(StoryLifecycle.Active, read.Lifecycle);
        Assert.True(read.IsReady);

        // The relationships survived, not just the rows.
        Assert.Equal(epic.Id, read.EpicId);
        Assert.Equal("Client delivery portal", read.EpicName);
        Assert.Equal("Client delivery excellence", read.InitiativeName);
        Assert.Equal("Maya Chen", read.AssistantName);
        Assert.Equal(sprint.Id, read.SprintId);
        Assert.Equal(SprintStatus.Active, read.SprintStatus);
        Assert.Equal("Draft the summary", Assert.Single(read.Tasks).Title);

        // Work started before the restart carries on afterwards.
        await afterwards.MoveAsync(story.Id, BoardStatus.Done);
        Assert.Equal(100, (await afterwards.ReadActiveBoardAsync())!.CompletionPercentage);

        // And the story key sequence picks up where it left off rather than colliding.
        var next = await afterwards.AddDraftStoryAsync(epic.Id, "Work created after the restart");
        Assert.Equal("QBC-102", next.Key);
    }
}
