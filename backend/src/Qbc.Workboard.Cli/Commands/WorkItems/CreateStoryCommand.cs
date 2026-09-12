using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class CreateStoryCommand
{
    public CreateStoryCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var epicIdOption = new Option<Guid?>("--epic-id") { Description = "Id of the parent epic." };
        var epicNameOption = new Option<string?>("--epic-name")
        {
            Description = "Name of the parent epic (looked up by exact, case-insensitive match)."
        };
        var initiativeIdOption = new Option<Guid?>("--initiative-id")
        {
            Description = "Optional: disambiguate --epic-name lookup by the parent initiative id."
        };
        var initiativeNameOption = new Option<string?>("--initiative-name")
        {
            Description = "Optional: disambiguate --epic-name lookup by the parent initiative name."
        };
        var titleOption = new Option<string>("--title") { Description = "Story title.", Required = true };
        var descriptionOption = new Option<string?>("--description") { Description = "Story description." };
        var acceptanceCriteriaOption = new Option<string?>("--acceptance-criteria") { Description = "Story acceptance criteria." };
        var pointsOption = new Option<int?>("--points") { Description = "Story points (1, 2, 3, 5, 8, or 13)." };
        var assigneeOption = new Option<string?>("--assignee")
        {
            Description = "Full name of the assistant to assign. Created automatically if no matching assistant exists."
        };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("create-story", "Create a story under an epic against the local or deployed Workboard API.");
        Command.Options.Add(epicIdOption);
        Command.Options.Add(epicNameOption);
        Command.Options.Add(initiativeIdOption);
        Command.Options.Add(initiativeNameOption);
        Command.Options.Add(titleOption);
        Command.Options.Add(descriptionOption);
        Command.Options.Add(acceptanceCriteriaOption);
        Command.Options.Add(pointsOption);
        Command.Options.Add(assigneeOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(passcodeOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var epicId = parseResult.GetValue(epicIdOption);
            var epicName = parseResult.GetValue(epicNameOption);
            if (epicId is null && string.IsNullOrWhiteSpace(epicName))
            {
                console.WriteError("Provide --epic-id or --epic-name.");
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

                if (epicId is null)
                {
                    var initiativeId = parseResult.GetValue(initiativeIdOption);
                    var initiativeName = parseResult.GetValue(initiativeNameOption);
                    if (initiativeId is null && !string.IsNullOrWhiteSpace(initiativeName))
                    {
                        var initiative = await client.FindInitiativeByNameAsync(initiativeName, cancellationToken);
                        if (initiative is null)
                        {
                            console.WriteError($"No initiative named '{initiativeName}' was found.");
                            return 1;
                        }

                        initiativeId = initiative.Id;
                    }

                    var epic = await client.FindEpicByNameAsync(initiativeId, epicName!, cancellationToken);
                    if (epic is null)
                    {
                        console.WriteError($"No epic named '{epicName}' was found.");
                        return 1;
                    }

                    epicId = epic.Id;
                }

                Guid? assistantId = null;
                var assignee = parseResult.GetValue(assigneeOption);
                if (!string.IsNullOrWhiteSpace(assignee))
                {
                    var assistant = await client.FindAssistantByNameAsync(assignee, cancellationToken)
                        ?? await client.CreateAssistantAsync(assignee, cancellationToken);
                    assistantId = assistant.Id;
                }

                var story = await client.CreateStoryAsync(
                    epicId.Value,
                    parseResult.GetValue(titleOption)!,
                    parseResult.GetValue(descriptionOption) ?? string.Empty,
                    parseResult.GetValue(acceptanceCriteriaOption) ?? string.Empty,
                    parseResult.GetValue(pointsOption),
                    assistantId,
                    cancellationToken);

                console.WriteLine($"Created story '{story.Key}: {story.Title}' ({story.Id}) under epic {story.EpicName}.");
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
