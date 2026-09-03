namespace Qbc.Workboard.Application.Features.Hierarchy.Dtos;

public sealed record EpicHierarchyDto(Guid Id, string Name, string Summary, int StoryCount, int CompletionPercentage);

