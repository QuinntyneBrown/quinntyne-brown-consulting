
namespace Qbc.Workboard.Application.Features.Sprints.Dtos;

public sealed record SprintDto(
    Guid Id,
    string Name,
    string Goal,
    DateOnly StartDate,
    DateOnly EndDate,
    SprintStatus Status,
    int StoryCount,
    IReadOnlyList<string> StoryKeys);

