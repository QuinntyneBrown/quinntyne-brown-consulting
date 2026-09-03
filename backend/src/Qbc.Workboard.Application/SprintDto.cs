using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record SprintDto(
    Guid Id,
    string Name,
    string Goal,
    DateOnly StartDate,
    DateOnly EndDate,
    SprintStatus Status,
    int StoryCount,
    IReadOnlyList<string> StoryKeys);

