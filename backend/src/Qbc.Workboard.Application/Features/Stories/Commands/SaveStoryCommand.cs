using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record SaveStoryCommand(
    Guid? Id,
    Guid EpicId,
    string Title,
    string Description,
    string AcceptanceCriteria,
    int? Points,
    Guid? AssistantId,
    IReadOnlyList<StoryTaskDraft> Tasks) : IRequest<StoryDto>, IValidatableRequest
{
    private static readonly HashSet<int> AllowedPoints = [1, 2, 3, 5, 8, 13];

    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (EpicId == Guid.Empty) errors["epicId"] = ["Epic is required."];
        if (string.IsNullOrWhiteSpace(Title)) errors["title"] = ["Title is required."];
        if (Points is not null && !AllowedPoints.Contains(Points.Value)) errors["points"] = ["Story points must be 1, 2, 3, 5, 8, or 13."];
        if (Tasks.Any(task => string.IsNullOrWhiteSpace(task.Title))) errors["tasks"] = ["Every task requires a title."];
        return errors;
    }
}

