using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Cli.Options;

namespace Qbc.Workboard.Cli.IntegrationTests;

public sealed class QueryDatabaseCommandIntegrationTests
{
    [Fact]
    public async Task Query_prints_the_rows_of_the_local_database()
    {
        await using var cli = CliTestHost.Create();
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Client portal");

        var exitCode = await cli.InvokeAsync("database", "query", "SELECT Name FROM Initiative");

        Assert.Equal(0, exitCode);
        Assert.Contains(cli.Console.Output, line => line.Contains("Target: local", StringComparison.Ordinal));
        Assert.Contains("Name", cli.Console.Output);
        Assert.Contains("Client portal", cli.Console.Output);
        Assert.Contains("(1 row)", cli.Console.Output);
    }

    [Fact]
    public async Task Query_can_target_the_azure_database()
    {
        await using var cli = CliTestHost.Create();
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Only in Azure", DatabaseTarget.Azure);
        await cli.AddInitiativeAsync(Guid.NewGuid(), "Only local");

        var exitCode = await cli.InvokeAsync("database", "query", "--target", "azure", "SELECT Name FROM Initiative");

        Assert.Equal(0, exitCode);
        Assert.Contains(cli.Console.Output, line => line.Contains("Target: azure", StringComparison.Ordinal));
        Assert.Contains("Only in Azure", cli.Console.Output);
        Assert.DoesNotContain("Only local", cli.Console.Output);
    }

    [Fact]
    public async Task Query_formats_nulls_and_reports_an_empty_result()
    {
        await using var cli = CliTestHost.Create();
        await cli.InvokeAsync("database", "initialize");

        var exitCode = await cli.InvokeAsync("database", "query", "SELECT CAST(NULL AS int) AS Missing, 42 AS Answer WHERE 1 = 0");

        Assert.Equal(0, exitCode);
        Assert.Contains("(0 rows)", cli.Console.Output);
        Assert.Contains(cli.Console.Output, line => line.StartsWith("Missing", StringComparison.Ordinal) && line.Contains("Answer", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Query_rolls_back_any_modification()
    {
        await using var cli = CliTestHost.Create();
        var initiativeId = Guid.NewGuid();
        await cli.AddInitiativeAsync(initiativeId, "Keep me");

        var exitCode = await cli.InvokeAsync("database", "query", "DELETE FROM Initiative; SELECT COUNT(*) AS Remaining FROM Initiative");

        Assert.Equal(0, exitCode);
        Assert.Contains(cli.Console.Output, line => line.StartsWith("0", StringComparison.Ordinal));
        Assert.True(await cli.InitiativeExistsAsync(initiativeId));
    }

    [Fact]
    public async Task Query_reports_invalid_sql_as_an_error()
    {
        await using var cli = CliTestHost.Create();
        await cli.InvokeAsync("database", "initialize");

        var exitCode = await cli.InvokeAsync("database", "query", "SELECT * FROM NoSuchTable");

        Assert.Equal(1, exitCode);
        Assert.Contains(cli.Console.Errors, line => line.Contains("NoSuchTable", StringComparison.Ordinal));
    }

    [Fact]
    public async Task Query_azure_without_a_configured_connection_is_rejected()
    {
        await using var cli = CliTestHost.Create(includeAzureConnection: false);

        var exitCode = await cli.InvokeAsync("database", "query", "--target", "azure", "SELECT 1");

        Assert.Equal(1, exitCode);
        Assert.Contains(cli.Console.Errors, line => line.Contains("WorkboardAzure", StringComparison.Ordinal));
    }
}
