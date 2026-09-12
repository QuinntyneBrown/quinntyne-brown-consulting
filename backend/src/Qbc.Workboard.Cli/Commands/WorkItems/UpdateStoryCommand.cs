using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class UpdateStoryCommand
{
    public UpdateStoryCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var storyIdOption = new Option<Guid?>("--story-id") { Description = "Id of the story to update." };
        var storyKeyOption = new Option<string?>("--story-key") { Description = "Key of the story to update, e.g. QBC-106." };
        var titleOption = new Option<string?>("--title") { Description = "New title. Leave unset to keep the current value." };
        var descriptionOption = new Option<string?>("--description") { Description = "New description. Leave unset to keep the current value." };
        var acceptanceCriteriaOption = new Option<string?>("--acceptance-criteria") { Description = "New acceptance criteria. Leave unset to keep the current value." };
        var pointsOption = new Option<int?>("--points") { Description = "New story points (1, 2, 3, 5, 8, or 13). Leave unset to keep the current value." };
        var assigneeOption = new Option<string?>("--assignee")
        {
            Description = "Full name of the assistant to assign. Created automatically if no matching assistant exists. Leave unset to keep the current value."
        };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("update-story", "Update fields on an existing story against the local or deployed Workboard API.");
        Command.Options.Add(storyIdOption);
        Command.Options.Add(storyKeyOption);
        Command.Options.Add(titleOption);
        Command.Options.Add(descriptionOption);
        Command.Options.Add(acceptanceCriteriaOption);
        Command.Options.Add(pointsOption);
        Command.Options.Add(assigneeOption);
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

                var assistantId = story.AssistantId;
                var assignee = parseResult.GetValue(assigneeOption);
                if (!string.IsNullOrWhiteSpace(assignee))
                {
                    var assistant = await client.FindAssistantByNameAsync(assignee, cancellationToken)
                        ?? await client.CreateAssistantAsync(assignee, cancellationToken);
                    assistantId = assistant.Id;
                }

                var updated = await client.UpdateStoryAsync(
                    story.Id,
                    story.EpicId,
                    parseResult.GetValue(titleOption) ?? story.Title,
                    parseResult.GetValue(descriptionOption) ?? story.Description,
                    parseResult.GetValue(acceptanceCriteriaOption) ?? story.AcceptanceCriteria,
                    parseResult.GetValue(pointsOption) ?? story.Points,
                    assistantId,
                    cancellationToken);

                console.WriteLine($"Updated story '{updated.Key}: {updated.Title}' ({updated.Id}).");
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
