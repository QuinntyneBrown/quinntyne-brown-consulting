namespace Qbc.Workboard.Api;

public sealed record StoryRequest(
    Guid EpicId,
    string Title,
    string Description,
    string AcceptanceCriteria,
    int? Points,
    Guid? AssistantId,
    IReadOnlyList<StoryTaskRequest> Tasks);

