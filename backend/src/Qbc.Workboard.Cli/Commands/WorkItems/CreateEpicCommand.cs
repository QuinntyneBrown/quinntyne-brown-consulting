using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class CreateEpicCommand
{
    public CreateEpicCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var initiativeIdOption = new Option<Guid?>("--initiative-id") { Description = "Id of the parent initiative." };
        var initiativeNameOption = new Option<string?>("--initiative-name")
        {
            Description = "Name of the parent initiative (looked up by exact, case-insensitive match)."
        };
        var nameOption = new Option<string>("--name") { Description = "Epic name.", Required = true };
        var summaryOption = new Option<string>("--summary") { Description = "Epic summary.", Required = true };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("create-epic", "Create an epic under an initiative against the local or deployed Workboard API.");
        Command.Options.Add(initiativeIdOption);
        Command.Options.Add(initiativeNameOption);
        Command.Options.Add(nameOption);
        Command.Options.Add(summaryOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(passcodeOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var initiativeId = parseResult.GetValue(initiativeIdOption);
            var initiativeName = parseResult.GetValue(initiativeNameOption);
            if (initiativeId is null && string.IsNullOrWhiteSpace(initiativeName))
            {
                console.WriteError("Provide --initiative-id or --initiative-name.");
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

                if (initiativeId is null)
                {
                    var initiative = await client.FindInitiativeByNameAsync(initiativeName!, cancellationToken);
                    if (initiative is null)
                    {
                        console.WriteError($"No initiative named '{initiativeName}' was found.");
                        return 1;
                    }

                    initiativeId = initiative.Id;
                }

                var epic = await client.CreateEpicAsync(
                    initiativeId.Value,
                    parseResult.GetValue(nameOption)!,
                    parseResult.GetValue(summaryOption)!,
                    cancellationToken);

                console.WriteLine($"Created epic '{epic.Name}' ({epic.Id}) under initiative {epic.InitiativeId}.");
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
