using Qbc.Workboard.Domain.Enums;
using System.CommandLine.Parsing;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

/// <summary>
/// Reads a priority the way a user types it — `very-high`, `VeryHigh`, or `veryhigh` all name the
/// same value — and reports the scale when the word is not on it.
/// </summary>
public static class StoryPriorityOption
{
    public static StoryPriority? Parse(ArgumentResult result)
    {
        var token = result.Tokens.SingleOrDefault()?.Value;
        if (string.IsNullOrWhiteSpace(token)) return null;
        var name = token.Replace("-", string.Empty).Replace("_", string.Empty).Replace(" ", string.Empty);
        if (Enum.TryParse<StoryPriority>(name, ignoreCase: true, out var priority) && Enum.IsDefined(priority)) return priority;
        result.AddError($"Priority '{token}' is not one of none, very-low, low, medium, high, very-high, or critical.");
        return null;
    }
}
