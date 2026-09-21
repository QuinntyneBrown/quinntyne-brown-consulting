namespace Qbc.Workboard.Api.Contracts.Requests;

/// <summary>One total across the stories named, in the order the remainder should favour.</summary>
public sealed record TimeEntryBatchRequest(
    IReadOnlyList<Guid> StoryIds,
    Guid AssistantId,
    DateOnly? WorkedOn,
    decimal TotalHours,
    string Note);
