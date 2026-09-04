
namespace Qbc.Workboard.Application.Features.Assistants.Dtos;

public sealed record AssistantHoursStoryDto(
    Guid StoryId,
    string StoryKey,
    string Title,
    string EpicName,
    BoardStatus BoardStatus,
    bool IsComplete,
    int? Points,
    decimal Hours,
    decimal StoryHours,
    IReadOnlyList<TimeEntryDto> Entries);
