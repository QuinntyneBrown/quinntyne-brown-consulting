using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed class StoryReadinessPolicy
{
    private static readonly HashSet<int> AllowedPoints = [1, 2, 3, 5, 8, 13];

    public IReadOnlyDictionary<string, string[]> Evaluate(Story story, bool epicExists)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(story.Title)) errors["title"] = ["Title is required."];
        if (!epicExists) errors["epicId"] = ["A valid epic is required."];
        if (string.IsNullOrWhiteSpace(story.Description)) errors["description"] = ["Description or user story is required."];
        if (string.IsNullOrWhiteSpace(story.AcceptanceCriteria)) errors["acceptanceCriteria"] = ["Acceptance criteria are required."];
        if (story.Points is null || !AllowedPoints.Contains(story.Points.Value)) errors["points"] = ["A valid story-point estimate is required."];
        return errors;
    }
}

