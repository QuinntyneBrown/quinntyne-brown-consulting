using System.Net;
using Qbc.Workboard.Application.Features.Attachments.Dtos;
using Qbc.Workboard.Application.Features.Stories.Dtos;
using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Domain.Enums;

namespace Qbc.Workboard.Cli.IntegrationTests;

// Traces to L2-055: one login serves a whole batch, the authoring commands included.
public sealed class AuthoringAccessTokenTests
{
    private static readonly Guid StoryId = Guid.NewGuid();
    private static readonly byte[] Bytes = [1, 2, 3];

    private static StoryDto Story() => new(StoryId, "QBC-101", Guid.NewGuid(), "Jobs", "Applications", "Apply", "Description", "Criteria", 2, StoryPriority.None, null, null, StoryLifecycle.Active, true, null, null, null, BoardStatus.ToDo, []);

    private static AttachmentDto Attachment() => new(Guid.NewGuid(), WorkItemKind.Story, StoryId, "resume.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", Bytes.Length, null, null, DateTimeOffset.UtcNow);

    [Fact]
    public async Task L2_055_Attach_file_reuses_a_configured_token_without_unlocking()
    {
        using var cli = WorkboardApiCliTestHost.Create("existing-token");
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Post, "/api/attachments", HttpStatusCode.Created, Attachment());
        var path = cli.WriteFile("resume.docx", Bytes);

        Assert.Equal(0, await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-101", "--file", path));

        Assert.DoesNotContain(cli.Api.Requests, request => request.PathAndQuery == "/api/access/unlock");
        var upload = Assert.Single(cli.Api.Requests, request => request.Method == "POST");
        Assert.Equal("Bearer existing-token", upload.Authorization);
    }

    [Fact]
    public async Task L2_055_Update_story_reuses_a_configured_token_without_unlocking()
    {
        using var cli = WorkboardApiCliTestHost.Create("existing-token");
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Put, $"/api/stories/{StoryId}", HttpStatusCode.OK, Story() with { Points = 5 });

        Assert.Equal(0, await cli.InvokeAsync("workitem", "update-story", "--story-key", "QBC-101", "--points", "5"));

        Assert.DoesNotContain(cli.Api.Requests, request => request.PathAndQuery == "/api/access/unlock");
        var update = Assert.Single(cli.Api.Requests, request => request.Method == "PUT");
        Assert.Equal("Bearer existing-token", update.Authorization);
    }

    [Fact]
    public async Task L2_056_Update_story_sends_the_chosen_priority_and_keeps_the_rest()
    {
        using var cli = WorkboardApiCliTestHost.Create("existing-token");
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Put, $"/api/stories/{StoryId}", HttpStatusCode.OK, Story() with { Priority = StoryPriority.High });

        Assert.Equal(0, await cli.InvokeAsync("workitem", "update-story", "--story-key", "QBC-101", "--priority", "high"));

        var update = Assert.Single(cli.Api.Requests, request => request.Method == "PUT");
        Assert.Contains("\"priority\":\"high\"", update.Body);
        Assert.Contains("\"points\":2", update.Body);
    }

    [Fact]
    public async Task L2_056_Update_story_keeps_the_current_priority_when_none_is_given()
    {
        using var cli = WorkboardApiCliTestHost.Create("existing-token");
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() with { Priority = StoryPriority.Critical } })
            .When(HttpMethod.Put, $"/api/stories/{StoryId}", HttpStatusCode.OK, Story() with { Priority = StoryPriority.Critical, Points = 5 });

        Assert.Equal(0, await cli.InvokeAsync("workitem", "update-story", "--story-key", "QBC-101", "--points", "5"));

        var update = Assert.Single(cli.Api.Requests, request => request.Method == "PUT");
        Assert.Contains("\"priority\":\"critical\"", update.Body);
    }

    [Theory]
    [InlineData("attach-file")]
    [InlineData("update-story")]
    public async Task L2_055_Refuse_without_a_token_or_passcode_before_any_request(string command)
    {
        using var cli = WorkboardApiCliTestHost.Create(accessToken: null, passcode: null);
        var path = cli.WriteFile("resume.docx", Bytes);
        string[] arguments = command == "attach-file"
            ? ["workitem", "attach-file", "--story-key", "QBC-101", "--file", path]
            : ["workitem", "update-story", "--story-key", "QBC-101", "--points", "5"];

        Assert.Equal(1, await cli.InvokeAsync(arguments));

        Assert.Empty(cli.Api.Requests);
        Assert.Contains("No passcode provided. Pass --passcode or set the Api:Passcode configuration value.", cli.Console.Errors);
    }
}
