namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record SprintRequest(string Name, string Goal, DateOnly StartDate);

