using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record SprintStoryCardDto(
    Guid StoryId,
    string Key,
    string Title,
    string EpicName,
    int? Points,
    Guid? AssistantId,
    string? AssistantName,
    int CompletedTasks,
    int TotalTasks,
    BoardStatus BoardStatus);

