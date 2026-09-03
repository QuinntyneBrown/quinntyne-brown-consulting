namespace Qbc.Workboard.Api;

public sealed record EpicRequest(Guid InitiativeId, string Name, string Summary);

