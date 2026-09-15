using Qbc.Workboard.Application.Features.Access.Dtos;
using Qbc.Workboard.Application.Features.Assistants.Dtos;
using Qbc.Workboard.Application.Features.Attachments.Dtos;
using Qbc.Workboard.Application.Features.Hierarchy.Dtos;
using Qbc.Workboard.Application.Features.Sprints.Dtos;
using Qbc.Workboard.Application.Features.Stories.Dtos;
using Qbc.Workboard.Domain.Enums;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Qbc.Workboard.Cli.Services;

public sealed class WorkboardApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    private readonly HttpClient _httpClient;

    public WorkboardApiClient(HttpClient httpClient) => _httpClient = httpClient;

    public async Task UnlockAsync(string passcode, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync("api/access/unlock", new UnlockRequest(passcode), JsonOptions, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        var token = await response.Content.ReadFromJsonAsync<AccessTokenDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The unlock response did not include an access token.");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.Token);
    }

    public async Task<InitiativeDto?> FindInitiativeByNameAsync(string name, CancellationToken cancellationToken)
    {
        var initiatives = await _httpClient.GetFromJsonAsync<IReadOnlyList<InitiativeDto>>("api/initiatives", JsonOptions, cancellationToken) ?? [];
        return initiatives.FirstOrDefault(initiative => string.Equals(initiative.Name, name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<InitiativeDto> CreateInitiativeAsync(string name, string description, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync("api/initiatives", new InitiativeRequest(name, description), JsonOptions, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<InitiativeDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The create-initiative response body was empty.");
    }

    public async Task<EpicDto?> FindEpicByNameAsync(Guid? initiativeId, string name, CancellationToken cancellationToken)
    {
        var url = initiativeId is null ? "api/epics" : $"api/epics?initiativeId={initiativeId}";
        var epics = await _httpClient.GetFromJsonAsync<IReadOnlyList<EpicDto>>(url, JsonOptions, cancellationToken) ?? [];
        return epics.FirstOrDefault(epic => string.Equals(epic.Name, name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<EpicDto> CreateEpicAsync(Guid initiativeId, string name, string summary, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync("api/epics", new EpicRequest(initiativeId, name, summary), JsonOptions, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<EpicDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The create-epic response body was empty.");
    }

    public async Task<AssistantDto?> FindAssistantByNameAsync(string fullName, CancellationToken cancellationToken)
    {
        var assistants = await _httpClient.GetFromJsonAsync<IReadOnlyList<AssistantDto>>("api/assistants", JsonOptions, cancellationToken) ?? [];
        return assistants.FirstOrDefault(assistant => string.Equals(assistant.FullName, fullName, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<AssistantDto> CreateAssistantAsync(string fullName, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync(
            "api/assistants",
            new AssistantRequest(fullName, "Team Member", [], Availability.Available),
            JsonOptions,
            cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<AssistantDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The create-assistant response body was empty.");
    }

    public async Task<StoryDto> CreateStoryAsync(
        Guid epicId,
        string title,
        string description,
        string acceptanceCriteria,
        int? points,
        Guid? assistantId,
        CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync(
            "api/stories",
            new StoryRequest(epicId, title, description, acceptanceCriteria, points, assistantId, []),
            JsonOptions,
            cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<StoryDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The create-story response body was empty.");
    }

    public async Task<StoryDto> GetStoryAsync(Guid id, CancellationToken cancellationToken) =>
        await _httpClient.GetFromJsonAsync<StoryDto>($"api/stories/{id}", JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException($"Story {id} was not found.");

    public async Task<StoryDto?> FindStoryByKeyAsync(string key, CancellationToken cancellationToken)
    {
        var stories = await _httpClient.GetFromJsonAsync<IReadOnlyList<StoryDto>>("api/stories/backlog", JsonOptions, cancellationToken) ?? [];
        return stories.FirstOrDefault(story => string.Equals(story.Key, key, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<StoryDto> UpdateStoryAsync(
        Guid id,
        Guid epicId,
        string title,
        string description,
        string acceptanceCriteria,
        int? points,
        Guid? assistantId,
        CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PutAsJsonAsync(
            $"api/stories/{id}",
            new StoryRequest(epicId, title, description, acceptanceCriteria, points, assistantId, []),
            JsonOptions,
            cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<StoryDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The update-story response body was empty.");
    }

    public async Task<StoryDto> GroomStoryAsync(Guid id, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsync($"api/stories/{id}/groom", content: null, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<StoryDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The groom-story response body was empty.");
    }

    public async Task<SprintDto?> FindSprintByNameAsync(string name, CancellationToken cancellationToken)
    {
        var sprints = await _httpClient.GetFromJsonAsync<IReadOnlyList<SprintDto>>("api/sprints", JsonOptions, cancellationToken) ?? [];
        return sprints.FirstOrDefault(sprint => string.Equals(sprint.Name, name, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<SprintDto> CreateSprintAsync(string name, string goal, DateOnly startDate, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync("api/sprints", new SprintRequest(name, goal, startDate), JsonOptions, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<SprintDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The create-sprint response body was empty.");
    }

    public async Task<StoryDto> AssignStoryToSprintAsync(Guid sprintId, Guid storyId, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PutAsync($"api/sprints/{sprintId}/stories/{storyId}", content: null, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<StoryDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The assign-sprint response body was empty.");
    }

    public async Task<AttachmentDto> UploadAttachmentAsync(
        WorkItemKind workItemKind,
        Guid workItemId,
        string fileName,
        string contentType,
        Stream content,
        Guid? uploadedByAssistantId,
        CancellationToken cancellationToken)
    {
        var file = new StreamContent(content);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);

        using var form = new MultipartFormDataContent
        {
            { file, "file", fileName },
            { new StringContent(workItemKind.ToString()), "workItemKind" },
            { new StringContent(workItemId.ToString()), "workItemId" }
        };

        if (uploadedByAssistantId is not null)
        {
            form.Add(new StringContent(uploadedByAssistantId.Value.ToString()), "uploadedByAssistantId");
        }

        using var response = await _httpClient.PostAsync("api/attachments", form, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<AttachmentDto>(JsonOptions, cancellationToken)
            ?? throw new InvalidOperationException("The attach-file response body was empty.");
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new InvalidOperationException(
            $"Request to {response.RequestMessage?.RequestUri} failed with {(int)response.StatusCode} {response.StatusCode}: {body}");
    }

    private sealed record UnlockRequest(string Passcode);

    private sealed record InitiativeRequest(string Name, string Description);

    private sealed record EpicRequest(Guid InitiativeId, string Name, string Summary);

    private sealed record AssistantRequest(string FullName, string Role, IReadOnlyList<string> Specialties, Availability Availability);

    private sealed record StoryRequest(
        Guid EpicId,
        string Title,
        string Description,
        string AcceptanceCriteria,
        int? Points,
        Guid? AssistantId,
        IReadOnlyList<object> Tasks);

    private sealed record SprintRequest(string Name, string Goal, DateOnly StartDate);
}
