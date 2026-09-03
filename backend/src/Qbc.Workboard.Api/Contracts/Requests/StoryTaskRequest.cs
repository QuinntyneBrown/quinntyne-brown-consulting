namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record StoryTaskRequest(Guid? Id, string Title, bool IsComplete, Guid? AssistantId);

