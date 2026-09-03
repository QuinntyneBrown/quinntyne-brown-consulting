using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record StoryDto(
    Guid Id,
    string Key,
    Guid EpicId,
    string EpicName,
    string InitiativeName,
    string Title,
    string Description,
    string AcceptanceCriteria,
    int? Points,
    Guid? AssistantId,
    string? AssistantName,
    StoryLifecycle Lifecycle,
    bool IsReady,
    Guid? SprintId,
    string? SprintName,
    SprintStatus? SprintStatus,
    BoardStatus BoardStatus,
    IReadOnlyList<StoryTaskDto> Tasks);

