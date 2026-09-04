namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record TimeEntryRequest(Guid StoryId, Guid AssistantId, DateOnly? WorkedOn, decimal Hours, string Note);
