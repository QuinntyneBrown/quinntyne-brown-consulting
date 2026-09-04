using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class WorkspaceAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_001_Open_a_route_directly()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var scheduled = await Given.AddReadyStoryAsync(epic.Id);
        var sprint = await Given.AddSprintAsync();
        await Given.PlanAsync(sprint.Id, scheduled.Id);
        await Given.StartAsync(sprint.Id);
        await Given.AddDraftStoryAsync(epic.Id, "Unscheduled work");

        // Opening any primary route directly loads that route's state from the backend.
        foreach (var route in new[] { "board", "backlog", "initiatives", "assistants" })
        {
            var response = await Client.GetAsync($"/api/workspace?route={route}");

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            var workspace = await response.Content.ReadFromJsonAsync<WorkspaceBootstrapDto>(Workspace.Json);
            Assert.NotNull(workspace);
            Assert.Equal(route, workspace.Route);
            Assert.True(workspace.HasActiveSprint);
            Assert.Equal(1, workspace.BacklogCount);
        }

        // A route the product does not have still opens the workspace, on the board.
        var fallback = await Client.GetFromJsonAsync<WorkspaceBootstrapDto>("/api/workspace?route=nowhere", Workspace.Json);
        Assert.NotNull(fallback);
        Assert.Equal("board", fallback.Route);
    }
}
