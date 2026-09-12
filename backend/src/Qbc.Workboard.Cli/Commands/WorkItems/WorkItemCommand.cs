using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class WorkItemCommand
{
    public WorkItemCommand(
        CreateInitiativeCommand createInitiativeCommand,
        CreateEpicCommand createEpicCommand,
        CreateStoryCommand createStoryCommand,
        UpdateStoryCommand updateStoryCommand,
        AssignSprintCommand assignSprintCommand)
    {
        Command = new Command("workitem", "Create and update initiatives, epics, and stories against the local or deployed Workboard API.");
        Command.Subcommands.Add(createInitiativeCommand.Command);
        Command.Subcommands.Add(createEpicCommand.Command);
        Command.Subcommands.Add(createStoryCommand.Command);
        Command.Subcommands.Add(updateStoryCommand.Command);
        Command.Subcommands.Add(assignSprintCommand.Command);
    }

    public Command Command { get; }
}
