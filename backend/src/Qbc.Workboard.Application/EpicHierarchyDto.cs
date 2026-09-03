namespace Qbc.Workboard.Application;

public sealed record EpicHierarchyDto(Guid Id, string Name, string Summary, int StoryCount, int CompletionPercentage);

