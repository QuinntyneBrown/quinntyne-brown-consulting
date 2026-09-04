using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Qbc.Workboard.Api;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

/// <summary>
/// The whole product in one pass. Every rule has its own named test; this one exists because
/// L2-037 asks the suite to exercise the backend's rules together, through the real controller,
/// mediator, validation, and persistence path.
/// </summary>
public sealed class ProductWorkflowAcceptanceTests : AcceptanceTest
{
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();

    [Fact]
    public async Task L2_037_Cover_backend_product_rules()
    {
        var initiativeResponse = await Client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("Client outcome", "Create a useful client outcome."));
        Assert.Equal(HttpStatusCode.Created, initiativeResponse.StatusCode);
        var initiative = await initiativeResponse.Content.ReadFromJsonAsync<InitiativeDto>(JsonOptions);
        Assert.NotNull(initiative);

        var epicResponse = await Client.PostAsJsonAsync("/api/epics", new EpicRequest(initiative.Id, "Delivery capability", "A body of client work."));
        var epic = await epicResponse.Content.ReadFromJsonAsync<EpicDto>(JsonOptions);
        Assert.NotNull(epic);

        var assistantResponse = await Client.PostAsJsonAsync("/api/assistants", new AssistantRequest("Alex Morgan", "Delivery assistant", ["APIs"], Availability.Available));
        var assistant = await assistantResponse.Content.ReadFromJsonAsync<AssistantDto>(JsonOptions);
        Assert.NotNull(assistant);

        var storyResponse = await Client.PostAsJsonAsync("/api/stories", new StoryRequest(
            epic.Id,
            "Deliver a useful increment",
            "As a consultant, I want one useful increment so that the client sees progress.",
            "The increment is available to review.",
            3,
            assistant.Id,
            [new StoryTaskRequest(null, "Build the increment", false, assistant.Id)]));
        Assert.Equal(HttpStatusCode.Created, storyResponse.StatusCode);
        var story = await storyResponse.Content.ReadFromJsonAsync<StoryDto>(JsonOptions);
        Assert.NotNull(story);
        Assert.Equal("QBC-101", story.Key);
        Assert.Equal(StoryLifecycle.Draft, story.Lifecycle);

        var groomed = await (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/groom", new { })).Content.ReadFromJsonAsync<StoryDto>(JsonOptions);
        Assert.NotNull(groomed);
        Assert.True(groomed.IsReady);
        Assert.Equal(StoryLifecycle.Active, groomed.Lifecycle);

        var sprintResponse = await Client.PostAsJsonAsync("/api/sprints", new SprintRequest("Sprint A", "Deliver the first useful increment.", new DateOnly(2026, 9, 7)));
        var sprint = await sprintResponse.Content.ReadFromJsonAsync<SprintDto>(JsonOptions);
        Assert.NotNull(sprint);
        Assert.Equal(new DateOnly(2026, 9, 20), sprint.EndDate);

        Assert.Equal(HttpStatusCode.OK, (await Client.PutAsJsonAsync($"/api/sprints/{sprint.Id}/stories/{story.Id}", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/start", new { })).StatusCode);
        Assert.Equal(HttpStatusCode.OK, (await Client.PostAsJsonAsync($"/api/stories/{story.Id}/move", new MoveStoryRequest(BoardStatus.Done))).StatusCode);

        var board = await Client.GetFromJsonAsync<ActiveSprintBoardDto>("/api/sprints/active/board", JsonOptions);
        Assert.NotNull(board);
        Assert.Equal(100, board.CompletionPercentage);
        Assert.Single(board.Stories);

        Assert.Equal(HttpStatusCode.OK, (await Client.PostAsJsonAsync($"/api/sprints/{sprint.Id}/complete", new { })).StatusCode);
        var historicalStory = await Client.GetFromJsonAsync<StoryDto>($"/api/stories/{story.Id}", JsonOptions);
        Assert.NotNull(historicalStory);
        Assert.Equal(SprintStatus.Completed, historicalStory.SprintStatus);
        Assert.Equal(HttpStatusCode.Conflict, (await Client.DeleteAsync($"/api/stories/{story.Id}")).StatusCode);
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }
}
