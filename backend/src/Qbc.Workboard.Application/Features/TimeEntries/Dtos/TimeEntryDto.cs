
namespace Qbc.Workboard.Application.Features.TimeEntries.Dtos;

public sealed record TimeEntryDto(
    Guid Id,
    Guid StoryId,
    string StoryKey,
    Guid AssistantId,
    string AssistantName,
    DateOnly WorkedOn,
    decimal Hours,
    string Note);
