namespace Qbc.Workboard.Application.Features.Assistants.Dtos;

public sealed record AssignmentLinkDto(Guid StoryId, string StoryKey, Guid? TaskId, string Label);

