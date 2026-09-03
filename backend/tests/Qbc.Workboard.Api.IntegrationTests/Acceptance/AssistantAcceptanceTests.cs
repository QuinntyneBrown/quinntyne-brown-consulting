using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Qbc.Workboard.Api;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class AssistantAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = CreateJsonOptions();
    private readonly HttpClient _client;

    public AssistantAcceptanceTests(WorkboardApiFactory factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Assigned_assistant_deletion_returns_blocking_work()
    {
        var initiative = await (await _client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("Assistant outcome", "Outcome for an assignment."))).Content.ReadFromJsonAsync<InitiativeDto>();
        Assert.NotNull(initiative);
        var epic = await (await _client.PostAsJsonAsync("/api/epics", new EpicRequest(initiative.Id, "Assistant epic", "Epic for an assignment."))).Content.ReadFromJsonAsync<EpicDto>();
        Assert.NotNull(epic);
        var assistant = await (await _client.PostAsJsonAsync("/api/assistants", new AssistantRequest("Sam Lee", "Product assistant", [], Availability.Limited))).Content.ReadFromJsonAsync<AssistantDto>(JsonOptions);
        Assert.NotNull(assistant);
        await _client.PostAsJsonAsync("/api/stories", new StoryRequest(epic.Id, "Assigned story", "", "", null, assistant.Id, []));

        var response = await _client.DeleteAsync($"/api/assistants/{assistant.Id}");

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("blocking", content, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("QBC-101", content);
    }

    private static JsonSerializerOptions CreateJsonOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }
}
