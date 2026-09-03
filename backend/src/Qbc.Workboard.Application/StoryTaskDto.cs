namespace Qbc.Workboard.Application;

public sealed record StoryTaskDto(Guid Id, string Title, bool IsComplete, Guid? AssistantId, string? AssistantName);

