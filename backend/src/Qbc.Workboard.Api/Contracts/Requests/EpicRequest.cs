namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record EpicRequest(Guid InitiativeId, string Name, string Summary);

