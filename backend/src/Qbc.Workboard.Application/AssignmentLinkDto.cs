namespace Qbc.Workboard.Application;

public sealed record AssignmentLinkDto(Guid StoryId, string StoryKey, Guid? TaskId, string Label);

