using System.Net;
using System.Text.Json;
using Qbc.Workboard.Application.Features.Attachments.Dtos;
using Qbc.Workboard.Application.Features.Stories.Dtos;
using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Domain.Enums;

namespace Qbc.Workboard.Cli.IntegrationTests;

// Traces to L2-054 and L2-055: safe inspection, exact downloads and guarded replacement.
public sealed class AttachmentMaintenanceCommandTests
{
    private static readonly Guid StoryId = Guid.NewGuid();
    private static readonly Guid AttachmentId = Guid.NewGuid();
    private static readonly byte[] Bytes = [0, 255, 13, 10, 128, 1];
    private static StoryDto Story() => new(StoryId, "QBC-101", Guid.NewGuid(), "Jobs", "Applications", "Apply", "Description", "Criteria", 1, StoryPriority.None, null, null, StoryLifecycle.Active, true, null, null, null, BoardStatus.ToDo, []);
    private static AttachmentDto Attachment() => new(AttachmentId, WorkItemKind.Story, StoryId, "resume.pdf", "application/pdf", Bytes.Length, null, null, DateTimeOffset.UtcNow, 3);
    private static WorkboardApiCliTestHost Host()
    {
        var cli = WorkboardApiCliTestHost.Create();
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Get, $"/api/attachments?workItemKind=Story&workItemId={StoryId}", HttpStatusCode.OK, new[] { Attachment() })
            .WhenBytes($"/api/attachments/{AttachmentId}/content", Bytes);
        return cli;
    }

    [Fact]
    public async Task Download_preserves_bytes_and_refuses_overwrite()
    {
        using var cli = Host();
        var output = Path.Combine(Path.GetDirectoryName(cli.WriteFile("marker", [1]))!, "download.pdf");
        string[] args = ["workitem", "download-attachment", "--story-key", "QBC-101", "--attachment-id", AttachmentId.ToString(), "--output", output, "--json"];
        Assert.Equal(0, await cli.InvokeAsync(args));
        Assert.Equal(Bytes, File.ReadAllBytes(output));
        Assert.Equal(1, await cli.InvokeAsync(args));
        Assert.Equal(Bytes, File.ReadAllBytes(output));
        Assert.Empty(Directory.GetFiles(Path.GetDirectoryName(output)!, "*.partial"));
    }

    [Fact]
    public async Task Download_failure_leaves_no_partial_output()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api.When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Get, $"/api/attachments?workItemKind=Story&workItemId={StoryId}", HttpStatusCode.OK, new[] { Attachment() });
        var output = Path.Combine(Path.GetDirectoryName(cli.WriteFile("marker", [1]))!, "download.pdf");
        Assert.Equal(1, await cli.InvokeAsync("workitem", "download-attachment", "--story-key", "QBC-101", "--attachment-id", AttachmentId.ToString(), "--output", output));
        Assert.False(File.Exists(output));
        Assert.Empty(Directory.GetFiles(Path.GetDirectoryName(output)!, "*.partial"));
    }

    [Fact]
    public async Task Replace_checks_ownership_and_sends_expected_revision()
    {
        using var cli = Host();
        cli.Api.When(HttpMethod.Put, $"/api/attachments/{AttachmentId}/content", HttpStatusCode.OK, Attachment() with { Revision = 4 });
        var path = cli.WriteFile("new-resume.pdf", Bytes);
        Assert.Equal(0, await cli.InvokeAsync("workitem", "replace-attachment", "--story-key", "QBC-101", "--attachment-id", AttachmentId.ToString(), "--file", path, "--expected-revision", "3", "--json"));
        var put = Assert.Single(cli.Api.Requests, request => request.Method == "PUT");
        Assert.Contains("expectedRevision", put.Body);
        Assert.Contains("\r\n3\r\n", put.Body);
        var result = JsonSerializer.Deserialize<JsonElement>(Assert.Single(cli.Console.Output));
        Assert.Equal(AttachmentId, result.GetProperty("id").GetGuid());
        Assert.Equal(4, result.GetProperty("revision").GetInt32());
    }

    [Theory]
    [InlineData("2", "resume.pdf", false)]
    [InlineData("-1", "resume.pdf", false)]
    [InlineData("3", "resume.docx", false)]
    [InlineData("3", "resume.pdf", true)]
    public async Task Refuse_stale_invalid_or_wrong_attachment_without_writing(string revision, string name, bool wrongId)
    {
        using var cli = Host();
        var path = cli.WriteFile(name, Bytes);
        Assert.Equal(1, await cli.InvokeAsync("workitem", "replace-attachment", "--story-key", "QBC-101", "--attachment-id", (wrongId ? Guid.NewGuid() : AttachmentId).ToString(), "--file", path, "--expected-revision", revision));
        Assert.DoesNotContain(cli.Api.Requests, request => request.Method is "PUT" or "DELETE");
    }

    [Fact]
    public async Task Refuse_ambiguous_story_selector()
    {
        using var cli = Host();
        Assert.Equal(1, await cli.InvokeAsync("workitem", "get-story", "--story-key", "QBC-101", "--story-id", StoryId.ToString()));
        Assert.Empty(cli.Api.Requests);
    }

    [Fact]
    public async Task Authentication_failure_returns_nonzero()
    {
        using var cli = Host();
        cli.Api.When(HttpMethod.Post, "/api/access/unlock", HttpStatusCode.Unauthorized);
        Assert.Equal(1, await cli.InvokeAsync("workitem", "list-assistants", "--json"));
        Assert.Single(cli.Api.Requests);
        Assert.Empty(cli.Console.Output);
    }
}
