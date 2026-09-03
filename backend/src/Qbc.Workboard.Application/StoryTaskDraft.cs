namespace Qbc.Workboard.Application;

public sealed record StoryTaskDraft(Guid? Id, string Title, bool IsComplete, Guid? AssistantId);

