using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class AssignSprintCommand
{
    public AssignSprintCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var storyIdOption = new Option<Guid?>("--story-id") { Description = "Id of the story to assign." };
        var storyKeyOption = new Option<string?>("--story-key") { Description = "Key of the story to assign, e.g. QBC-106." };
        var sprintIdOption = new Option<Guid?>("--sprint-id") { Description = "Id of the sprint to assign the story to." };
        var sprintNameOption = new Option<string?>("--sprint-name")
        {
            Description = "Name of the sprint to assign the story to. Created automatically if no matching sprint exists."
        };
        var sprintGoalOption = new Option<string?>("--sprint-goal") { Description = "Goal used only when creating a new sprint." };
        var sprintStartOption = new Option<DateOnly?>("--sprint-start")
        {
            Description = "Start date used only when creating a new sprint. Defaults to today."
        };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("assign-sprint", "Groom a story ready and assign it to a sprint against the local or deployed Workboard API.");
        Command.Options.Add(storyIdOption);
        Command.Options.Add(storyKeyOption);
        Command.Options.Add(sprintIdOption);
        Command.Options.Add(sprintNameOption);
        Command.Options.Add(sprintGoalOption);
        Command.Options.Add(sprintStartOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(passcodeOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var storyId = parseResult.GetValue(storyIdOption);
            var storyKey = parseResult.GetValue(storyKeyOption);
            if (storyId is null && string.IsNullOrWhiteSpace(storyKey))
            {
                console.WriteError("Provide --story-id or --story-key.");
                return 1;
            }

            var sprintId = parseResult.GetValue(sprintIdOption);
            var sprintName = parseResult.GetValue(sprintNameOption);
            if (sprintId is null && string.IsNullOrWhiteSpace(sprintName))
            {
                console.WriteError("Provide --sprint-id or --sprint-name.");
                return 1;
            }

            var passcode = PasscodeOption.Resolve(parseResult.GetValue(passcodeOption), configuration);
            if (string.IsNullOrWhiteSpace(passcode))
            {
                console.WriteError("No passcode provided. Pass --passcode or set the Api:Passcode configuration value.");
                return 1;
            }

            try
            {
                var client = clientFactory.Create(parseResult.GetValue(targetOption));
                await client.UnlockAsync(passcode, cancellationToken);

                var story = storyId is not null
                    ? await client.GetStoryAsync(storyId.Value, cancellationToken)
                    : await client.FindStoryByKeyAsync(storyKey!, cancellationToken);
                if (story is null)
                {
                    console.WriteError($"No story with key '{storyKey}' was found.");
                    return 1;
                }

                if (!story.IsReady)
                {
                    story = await client.GroomStoryAsync(story.Id, cancellationToken);
                }

                if (sprintId is null)
                {
                    var sprint = await client.FindSprintByNameAsync(sprintName!, cancellationToken)
                        ?? await client.CreateSprintAsync(
                            sprintName!,
                            parseResult.GetValue(sprintGoalOption) ?? string.Empty,
                            parseResult.GetValue(sprintStartOption) ?? DateOnly.FromDateTime(DateTime.UtcNow),
                            cancellationToken);
                    sprintId = sprint.Id;
                }

                var assigned = await client.AssignStoryToSprintAsync(sprintId.Value, story.Id, cancellationToken);
                console.WriteLine($"Assigned story '{assigned.Key}: {assigned.Title}' to sprint '{assigned.SprintName}'.");
                return 0;
            }
            catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
            {
                console.WriteError(exception.Message);
                return 1;
            }
        });
    }

    public Command Command { get; }
}
