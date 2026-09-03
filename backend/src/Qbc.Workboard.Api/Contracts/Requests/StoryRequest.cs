namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record StoryRequest(
    Guid EpicId,
    string Title,
    string Description,
    string AcceptanceCriteria,
    int? Points,
    Guid? AssistantId,
    IReadOnlyList<StoryTaskRequest> Tasks);

