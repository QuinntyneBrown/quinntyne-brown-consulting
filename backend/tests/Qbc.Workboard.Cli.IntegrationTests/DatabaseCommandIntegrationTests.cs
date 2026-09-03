using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Cli.Options;

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
    public async Task Initialize_can_explicitly_target_the_local_database()
    {
        await using var cli = CliTestHost.Create();

        var exitCode = await cli.InvokeAsync("database", "initialize", "--target", "local");
        var state = await cli.ReadStateAsync();

        Assert.Equal(0, exitCode);
        Assert.True(state.IsCurrent);
        Assert.Contains(cli.Console.Output, line => line.Contains("Target: local", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Initialize_can_target_the_azure_database_without_touching_local()
    {
        await using var cli = CliTestHost.Create();
        var localId = Guid.NewGuid();
        await cli.AddInitiativeAsync(localId, "Keep local");

        var exitCode = await cli.InvokeAsync("database", "initialize", "--target", "azure");
        var azureState = await cli.ReadStateAsync(DatabaseTarget.Azure);

        Assert.Equal(0, exitCode);
        Assert.True(azureState.IsCurrent);
        Assert.Equal(0, azureState.Initiatives);
        Assert.True(await cli.InitiativeExistsAsync(localId));
        Assert.Contains(cli.Console.Output, line => line.Contains("Target: azure", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Initialize_with_seed_can_target_the_azure_database()
    {
        await using var cli = CliTestHost.Create();

        var exitCode = await cli.InvokeAsync("database", "initialize", "--target", "azure", "--seed");
        var state = await cli.ReadStateAsync(DatabaseTarget.Azure);

        Assert.Equal(0, exitCode);
        Assert.Equal(
            (2, 3, 7, 4, 3, 3, 1),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
    }

    [Fact]
    public async Task Initialize_azure_without_a_configured_connection_is_rejected_without_using_local()
    {
        await using var cli = CliTestHost.Create(includeAzureConnection: false);
        var localId = Guid.NewGuid();
        await cli.AddInitiativeAsync(localId, "Keep local");

        var exitCode = await cli.InvokeAsync("database", "initialize", "--target", "azure");

        Assert.Equal(1, exitCode);
        Assert.True(await cli.InitiativeExistsAsync(localId));
        Assert.Contains(cli.Console.Errors, line => line.Contains("WorkboardAzure", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Initialize_rejects_an_unknown_target()
    {
        await using var cli = CliTestHost.Create();

        var exitCode = await cli.InvokeAsync("database", "initialize", "--target", "elsewhere");

        Assert.NotEqual(0, exitCode);
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

    [Fact]
    public async Task Azure_reset_requires_force_even_when_the_local_force_requirement_is_disabled()
    {
        await using var cli = CliTestHost.Create(requireForce: false);
        var initiativeId = Guid.NewGuid();
        await cli.AddInitiativeAsync(initiativeId, "Keep me", DatabaseTarget.Azure);

        var exitCode = await cli.InvokeAsync(
            "database", "reset", "--target", "azure", "--confirm-database", cli.GetDatabaseName(DatabaseTarget.Azure));

        Assert.Equal(1, exitCode);
        Assert.True(await cli.InitiativeExistsAsync(initiativeId, DatabaseTarget.Azure));
    }

    [Fact]
    public async Task Azure_reset_requires_the_exact_database_name()
    {
        await using var cli = CliTestHost.Create();
        var initiativeId = Guid.NewGuid();
        await cli.AddInitiativeAsync(initiativeId, "Keep me", DatabaseTarget.Azure);

        var missingExitCode = await cli.InvokeAsync("database", "reset", "--target", "azure", "--force");
        var mismatchExitCode = await cli.InvokeAsync(
            "database", "reset", "--target", "azure", "--force", "--confirm-database", "WrongDatabase");

        Assert.Equal(1, missingExitCode);
        Assert.Equal(1, mismatchExitCode);
        Assert.True(await cli.InitiativeExistsAsync(initiativeId, DatabaseTarget.Azure));
        Assert.Contains(cli.Console.Errors, line => line.Contains("--confirm-database", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Azure_reset_rebuilds_schema_in_place_and_does_not_touch_local()
    {
        await using var cli = CliTestHost.Create();
        var localId = Guid.NewGuid();
        var azureId = Guid.NewGuid();
        await cli.AddInitiativeAsync(localId, "Keep local");
        await cli.AddInitiativeAsync(azureId, "Remove Azure", DatabaseTarget.Azure);
        var databaseName = cli.GetDatabaseName(DatabaseTarget.Azure);
        var databaseId = await cli.GetDatabaseIdAsync(DatabaseTarget.Azure);

        var exitCode = await cli.InvokeAsync(
            "database", "reset", "--target", "azure", "--force", "--confirm-database", databaseName);
        var azureState = await cli.ReadStateAsync(DatabaseTarget.Azure);

        Assert.Equal(0, exitCode);
        Assert.True(azureState.IsCurrent);
        Assert.Equal(0, azureState.Initiatives);
        Assert.Equal(databaseId, await cli.GetDatabaseIdAsync(DatabaseTarget.Azure));
        Assert.True(await cli.InitiativeExistsAsync(localId));
    }

    [Fact]
    public async Task Azure_reset_can_seed_without_recreating_the_database()
    {
        await using var cli = CliTestHost.Create();
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Remove Azure", DatabaseTarget.Azure);
        var databaseName = cli.GetDatabaseName(DatabaseTarget.Azure);
        var databaseId = await cli.GetDatabaseIdAsync(DatabaseTarget.Azure);

        var exitCode = await cli.InvokeAsync(
            "database", "reset", "--target", "azure", "--force", "--confirm-database", databaseName, "--seed");
        var state = await cli.ReadStateAsync(DatabaseTarget.Azure);

        Assert.Equal(0, exitCode);
        Assert.Equal(databaseId, await cli.GetDatabaseIdAsync(DatabaseTarget.Azure));
        Assert.Equal(
            (2, 3, 7, 4, 3, 3, 1),
            (state.Initiatives, state.Epics, state.Stories, state.StoryTasks, state.Assistants, state.Sprints, state.StoryKeySequences));
    }
}
