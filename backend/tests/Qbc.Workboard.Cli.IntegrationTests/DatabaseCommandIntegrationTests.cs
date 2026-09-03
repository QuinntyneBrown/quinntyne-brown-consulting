using Qbc.Workboard.Cli.IntegrationTests.Support;

namespace Qbc.Workboard.Cli.IntegrationTests;

public sealed class DatabaseCommandIntegrationTests
{
    [Fact]
    public async Task Initialize_creates_an_empty_current_database()
    {
        await using var cli = CliTestHost.Create();

        var exitCode = await cli.InvokeAsync("database", "initialize");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.True(state.IsCurrent);
        Assert.Equal(
            (0, 0, 0, 0, 0, 0, 0),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
        Assert.Contains(cli.Console.Output, line => line.Contains("initialized", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Initialize_with_seed_adds_representative_data()
    {
        await using var cli = CliTestHost.Create();

        var exitCode = await cli.InvokeAsync("database", "initialize", "--seed");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.True(state.IsCurrent);
        Assert.Equal(
            (2, 3, 7, 4, 3, 3, 1),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
    }

    [Fact]
    public async Task Initialize_preserves_existing_data()
    {
        await using var cli = CliTestHost.Create();
        var initiativeId = Guid.NewGuid();
        await cli.AddInitiativeAsync(initiativeId, "Keep me");

        var exitCode = await cli.InvokeAsync("database", "initialize");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.Equal(1, state.Initiatives);
    }

    [Fact]
    public async Task Reset_without_force_is_rejected_and_preserves_data()
    {
        await using var cli = CliTestHost.Create();
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Keep me");

        var exitCode = await cli.InvokeAsync("database", "reset");
        var state = await cli.ReadStateAsync();

        Assert.Equal(1, exitCode);
        Assert.Equal(1, state.Initiatives);
        Assert.Contains(cli.Console.Errors, line => line.Contains("--force", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Reset_with_force_replaces_existing_data_with_an_empty_current_database()
    {
        await using var cli = CliTestHost.Create();
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Remove me");

        var exitCode = await cli.InvokeAsync("database", "reset", "--force");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.True(state.IsCurrent);
        Assert.Equal(
            (0, 0, 0, 0, 0, 0, 0),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
        Assert.Contains(cli.Console.Output, line => line.Contains("reset", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Reset_with_seed_replaces_existing_data_with_representative_data()
    {
        await using var cli = CliTestHost.Create();
        var removedId = Guid.NewGuid();
        await cli.AddInitiativeAsync(removedId, "Remove me");

        var exitCode = await cli.InvokeAsync("database", "reset", "--force", "--seed");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.Equal(
            (2, 3, 7, 4, 3, 3, 1),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
        Assert.False(await cli.InitiativeExistsAsync(removedId));
    }

    [Fact]
    public async Task Reset_can_disable_the_force_requirement_through_options()
    {
        await using var cli = CliTestHost.Create(requireForce: false);
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Remove me");

        var exitCode = await cli.InvokeAsync("database", "reset");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.Equal(0, state.Initiatives);
    }
}
