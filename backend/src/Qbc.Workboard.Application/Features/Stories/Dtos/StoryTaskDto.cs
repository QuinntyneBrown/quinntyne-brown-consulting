namespace Qbc.Workboard.Application.Features.Stories.Dtos;

public sealed record StoryTaskDto(Guid Id, string Title, bool IsComplete, Guid? AssistantId, string? AssistantName);

