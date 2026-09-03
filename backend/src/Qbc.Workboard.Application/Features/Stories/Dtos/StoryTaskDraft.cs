namespace Qbc.Workboard.Application.Features.Stories.Dtos;

public sealed record StoryTaskDraft(Guid? Id, string Title, bool IsComplete, Guid? AssistantId);

