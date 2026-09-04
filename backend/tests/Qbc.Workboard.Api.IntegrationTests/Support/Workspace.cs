using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

/// <summary>
/// Builds the records a scenario's Given clause assumes, through the same HTTP contract a client
/// uses. Nothing here asserts: a test that needs a Ready story in an active sprint says so once and
/// spends its assertions on the behaviour it is actually about.
/// </summary>
public sealed class Workspace
{
    public static readonly JsonSerializerOptions Json = CreateJson();

    private readonly HttpClient _client;

    public Workspace(HttpClient client) => _client = client;

    public async Task<InitiativeDto> AddInitiativeAsync(
        string name = "Client delivery excellence",
        string description = "Make every engagement transparent and predictable.")
    {
        var response = await _client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest(name, description));
        return await ReadAsync<InitiativeDto>(response);
    }

    public async Task<EpicDto> AddEpicAsync(
        Guid initiativeId,
        string name = "Client delivery portal",
        string summary = "Give clients a clear view of outcomes.")
    {
        var response = await _client.PostAsJsonAsync("/api/epics", new EpicRequest(initiativeId, name, summary));
        return await ReadAsync<EpicDto>(response);
    }

    public async Task<AssistantDto> AddAssistantAsync(
        string fullName = "Maya Chen",
        string role = "Product delivery assistant",
        IReadOnlyList<string>? specialties = null,
        Availability availability = Availability.Available)
    {
        var response = await _client.PostAsJsonAsync(
            "/api/assistants",
            new AssistantRequest(fullName, role, specialties ?? [], availability));
        return await ReadAsync<AssistantDto>(response);
    }

    /// <summary>An epic with an initiative above it, which almost every story scenario needs.</summary>
    public async Task<EpicDto> AddEpicWithInitiativeAsync()
    {
        var initiative = await AddInitiativeAsync();
        return await AddEpicAsync(initiative.Id);
    }

    /// <summary>A Draft story: no description, no acceptance criteria, no estimate.</summary>
    public async Task<StoryDto> AddDraftStoryAsync(Guid epicId, string title = "Share milestone notes")
    {
        var response = await _client.PostAsJsonAsync(
            "/api/stories",
            new StoryRequest(epicId, title, string.Empty, string.Empty, null, null, []));
        return await ReadAsync<StoryDto>(response);
    }

    /// <summary>A story carrying every grooming field, so it can be made Ready.</summary>
    public async Task<StoryDto> AddGroomableStoryAsync(
        Guid epicId,
        string title = "Publish an engagement health summary",
        int points = 5,
        Guid? assistantId = null,
        IReadOnlyList<StoryTaskRequest>? tasks = null)
    {
        var response = await _client.PostAsJsonAsync(
            "/api/stories",
            new StoryRequest(
                epicId,
                title,
                "As a client, I want a health summary so that I can steer the engagement.",
                "Status, risks, and the next milestone are visible in one place.",
                points,
                assistantId,
                tasks ?? []));
        return await ReadAsync<StoryDto>(response);
    }

    /// <summary>A story that has been groomed, so it is Active and Ready.</summary>
    public async Task<StoryDto> AddReadyStoryAsync(
        Guid epicId,
        string title = "Publish an engagement health summary",
        int points = 5,
        Guid? assistantId = null,
        IReadOnlyList<StoryTaskRequest>? tasks = null)
    {
        var story = await AddGroomableStoryAsync(epicId, title, points, assistantId, tasks);
        return await GroomAsync(story.Id);
    }

    public async Task<StoryDto> GroomAsync(Guid storyId)
    {
        var response = await _client.PostAsJsonAsync($"/api/stories/{storyId}/groom", new { });
        return await ReadAsync<StoryDto>(response);
    }

    public async Task<SprintDto> AddSprintAsync(
        string name = "Sprint 14",
        string goal = "Make engagement status effortless to understand.",
        DateOnly? startDate = null)
    {
        var response = await _client.PostAsJsonAsync(
            "/api/sprints",
            new SprintRequest(name, goal, startDate ?? new DateOnly(2026, 8, 17)));
        return await ReadAsync<SprintDto>(response);
    }

    public async Task PlanAsync(Guid sprintId, Guid storyId)
    {
        var response = await _client.PutAsJsonAsync($"/api/sprints/{sprintId}/stories/{storyId}", new { });
        response.EnsureSuccessStatusCode();
    }

    public async Task<SprintDto> StartAsync(Guid sprintId)
    {
        var response = await _client.PostAsJsonAsync($"/api/sprints/{sprintId}/start", new { });
        return await ReadAsync<SprintDto>(response);
    }

    public async Task<SprintDto> CompleteAsync(Guid sprintId)
    {
        var response = await _client.PostAsJsonAsync($"/api/sprints/{sprintId}/complete", new { });
        return await ReadAsync<SprintDto>(response);
    }

    public async Task<StoryDto> MoveAsync(Guid storyId, BoardStatus status)
    {
        var response = await _client.PostAsJsonAsync($"/api/stories/{storyId}/move", new MoveStoryRequest(status));
        return await ReadAsync<StoryDto>(response);
    }

    public async Task<StoryDto> ArchiveAsync(Guid storyId)
    {
        var response = await _client.PostAsJsonAsync($"/api/stories/{storyId}/archive", new { });
        return await ReadAsync<StoryDto>(response);
    }

    /// <summary>
    /// A started sprint holding one Done story and one still in flight, which is the arrangement an
    /// assistant's hours are reported against: some time on finished work, some on work in progress.
    /// </summary>
    public async Task<(StoryDto Done, StoryDto InFlight)> AddSprintWithDoneAndInFlightStoriesAsync(
        Guid epicId,
        string doneTitle = "Publish an engagement health summary",
        string inFlightTitle = "Capture a client decision")
    {
        var done = await AddReadyStoryAsync(epicId, doneTitle, 5);
        var inFlight = await AddReadyStoryAsync(epicId, inFlightTitle, 3);
        var sprint = await AddSprintAsync();
        await PlanAsync(sprint.Id, done.Id);
        await PlanAsync(sprint.Id, inFlight.Id);
        await StartAsync(sprint.Id);
        return (await MoveAsync(done.Id, BoardStatus.Done), await ReadStoryAsync(inFlight.Id));
    }

    public async Task<TimeEntryDto> LogTimeAsync(
        Guid storyId,
        Guid assistantId,
        DateOnly? workedOn = null,
        decimal hours = 1.5m,
        string note = "")
    {
        var response = await _client.PostAsJsonAsync(
            "/api/time-entries",
            new TimeEntryRequest(storyId, assistantId, workedOn ?? new DateOnly(2026, 8, 31), hours, note));
        return await ReadAsync<TimeEntryDto>(response);
    }

    public async Task<TimeEntryDto> AmendTimeAsync(
        Guid entryId,
        Guid storyId,
        Guid assistantId,
        DateOnly? workedOn = null,
        decimal hours = 1.5m,
        string note = "")
    {
        var response = await _client.PutAsJsonAsync(
            $"/api/time-entries/{entryId}",
            new TimeEntryRequest(storyId, assistantId, workedOn ?? new DateOnly(2026, 8, 31), hours, note));
        return await ReadAsync<TimeEntryDto>(response);
    }

    /// <summary>A Done story kept in a completed sprint: the workspace's immutable history.</summary>
    public async Task<(SprintDto Sprint, StoryDto Story)> AddCompletedSprintHistoryAsync(
        Guid epicId,
        string sprintName = "Sprint 13",
        string storyTitle = "Agree the engagement kickoff agenda")
    {
        var story = await AddReadyStoryAsync(epicId, storyTitle, 2);
        var sprint = await AddSprintAsync(sprintName, "Establish a delivery baseline.", new DateOnly(2026, 8, 3));
        await PlanAsync(sprint.Id, story.Id);
        await StartAsync(sprint.Id);
        await MoveAsync(story.Id, BoardStatus.Done);
        var completed = await CompleteAsync(sprint.Id);
        return (completed, await ReadStoryAsync(story.Id));
    }

    public async Task<InitiativeDto> ReadInitiativeAsync(Guid initiativeId) =>
        (await _client.GetFromJsonAsync<InitiativeDto>($"/api/initiatives/{initiativeId}", Json))!;

    public async Task<EpicDto> ReadEpicAsync(Guid epicId) =>
        (await _client.GetFromJsonAsync<EpicDto>($"/api/epics/{epicId}", Json))!;

    public async Task<StoryDto> ReadStoryAsync(Guid storyId) =>
        (await _client.GetFromJsonAsync<StoryDto>($"/api/stories/{storyId}", Json))!;

    public async Task<SprintDto> ReadSprintAsync(Guid sprintId) =>
        (await _client.GetFromJsonAsync<SprintDto>($"/api/sprints/{sprintId}", Json))!;

    public async Task<AssistantDto> ReadAssistantAsync(Guid assistantId) =>
        (await _client.GetFromJsonAsync<AssistantDto>($"/api/assistants/{assistantId}", Json))!;

    public async Task<AssistantHoursDto> ReadAssistantHoursAsync(Guid assistantId) =>
        (await _client.GetFromJsonAsync<AssistantHoursDto>($"/api/assistants/{assistantId}/hours", Json))!;

    public async Task<IReadOnlyList<StoryDto>> ReadBacklogAsync() =>
        (await _client.GetFromJsonAsync<IReadOnlyList<StoryDto>>("/api/stories/backlog", Json))!;

    public async Task<HierarchyDto> ReadHierarchyAsync() =>
        (await _client.GetFromJsonAsync<HierarchyDto>("/api/initiatives/hierarchy", Json))!;

    public async Task<ActiveSprintBoardDto?> ReadActiveBoardAsync() =>
        await _client.GetFromJsonAsync<ActiveSprintBoardDto?>("/api/sprints/active/board", Json);

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response)
    {
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<T>(Json))!;
    }

    private static JsonSerializerOptions CreateJson()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }
}
