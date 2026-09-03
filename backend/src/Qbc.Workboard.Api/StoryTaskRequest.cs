namespace Qbc.Workboard.Api;

public sealed record StoryTaskRequest(Guid? Id, string Title, bool IsComplete, Guid? AssistantId);

