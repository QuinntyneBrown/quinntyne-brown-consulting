namespace Qbc.Workboard.Application;

public sealed record InitiativeHierarchyDto(
    Guid Id,
    string Name,
    string Description,
    int EpicCount,
    int StoryCount,
    IReadOnlyList<EpicHierarchyDto> Epics);

