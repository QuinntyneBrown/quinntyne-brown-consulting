using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class CreateInitiativeCommand
{
    public CreateInitiativeCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var nameOption = new Option<string>("--name") { Description = "Initiative name.", Required = true };
        var descriptionOption = new Option<string>("--description") { Description = "Initiative description.", Required = true };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("create-initiative", "Create an initiative against the local or deployed Workboard API.");
        Command.Options.Add(nameOption);
        Command.Options.Add(descriptionOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(passcodeOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
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

                var initiative = await client.CreateInitiativeAsync(
                    parseResult.GetValue(nameOption)!,
                    parseResult.GetValue(descriptionOption)!,
                    cancellationToken);

                console.WriteLine($"Created initiative '{initiative.Name}' ({initiative.Id}).");
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
