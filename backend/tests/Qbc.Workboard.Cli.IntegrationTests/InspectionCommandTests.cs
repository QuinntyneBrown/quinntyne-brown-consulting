using System.Net;
using System.Text.Json;
using Qbc.Workboard.Application.Features.Stories.Dtos;
using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Domain.Enums;

namespace Qbc.Workboard.Cli.IntegrationTests;

// Traces to L2-054: discovery includes sprint work and never mutates stories.
public sealed class InspectionCommandTests
{
    [Fact]
    public async Task L2_054_Reuse_token_without_repeated_unlock_requests()
    {
        using var cli = WorkboardApiCliTestHost.Create("existing-token");
        cli.Api.When(HttpMethod.Get, "/api/assistants", HttpStatusCode.OK, Array.Empty<object>());
        Assert.Equal(0, await cli.InvokeAsync("workitem", "list-assistants", "--json"));
        var request = Assert.Single(cli.Api.Requests);
        Assert.Equal("GET", request.Method);
        Assert.Equal("Bearer existing-token", request.Authorization);
    }

    [Fact]
    public async Task L2_054_List_unfinished_by_exact_assignee_includes_sprint_work()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        var assignee = Guid.NewGuid();
        cli.Api.When(HttpMethod.Get, "/api/assistants", HttpStatusCode.OK,
            new[] { new Qbc.Workboard.Application.Features.Assistants.Dtos.AssistantDto(assignee, "Vanessa", "Applications", [], Availability.Available, 0, 0, []) });
        var story = new StoryDto(Guid.NewGuid(), "QBC-101", Guid.NewGuid(), "Jobs", "Applications", "Apply", "Description", "Criteria", 1, StoryPriority.None, assignee, "Vanessa", StoryLifecycle.Active, true, Guid.NewGuid(), "Sprint", SprintStatus.Active, BoardStatus.InProgress, []);
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] {
            story, story with { Key = "QBC-102", BoardStatus = BoardStatus.Done },
            story with { Key = "QBC-103", Lifecycle = StoryLifecycle.Archived },
            story with { Key = "QBC-104", AssistantId = Guid.NewGuid() }
        });
        Assert.Equal(0, await cli.InvokeAsync("workitem", "list-stories", "--assignee-id", assignee.ToString(), "--unfinished", "--json"));
        var output = string.Join("\n", cli.Console.Output);
        Assert.Contains("QBC-101", output);
        Assert.DoesNotContain("QBC-102", output);
        Assert.DoesNotContain("QBC-103", output);
        Assert.DoesNotContain("QBC-104", output);
        Assert.DoesNotContain(cli.Api.Requests, request => request.Method is "PUT" or "DELETE");
    }
}
