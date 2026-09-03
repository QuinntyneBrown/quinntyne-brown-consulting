namespace Qbc.Workboard.Application.Features.Sprints.Dtos;

public sealed record ActiveSprintBoardDto(
    Guid SprintId,
    string Name,
    string Goal,
    DateOnly StartDate,
    DateOnly EndDate,
    int DoneCount,
    int TotalCount,
    int CompletionPercentage,
    IReadOnlyList<SprintStoryCardDto> Stories);

