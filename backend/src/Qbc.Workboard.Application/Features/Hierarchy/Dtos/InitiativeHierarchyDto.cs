namespace Qbc.Workboard.Application.Features.Hierarchy.Dtos;

public sealed record InitiativeHierarchyDto(
    Guid Id,
    string Name,
    string Description,
    int EpicCount,
    int StoryCount,
    IReadOnlyList<EpicHierarchyDto> Epics);

