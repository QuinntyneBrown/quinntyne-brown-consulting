using Qbc.Workboard.Application.Features.Assistants.Dtos;
using Qbc.Workboard.Application.Features.Attachments.Dtos;
using Qbc.Workboard.Application.Features.Stories.Dtos;
using Qbc.Workboard.Cli.IntegrationTests.Support;
using Qbc.Workboard.Domain.Enums;
using System.Net;
using System.Text;

namespace Qbc.Workboard.Cli.IntegrationTests;

/// <summary>
/// The <c>workitem</c> commands talk to the API rather than the database, so these tests run the
/// CLI over <see cref="FakeWorkboardApiHandler"/> and need neither SQL Server nor a running API.
/// </summary>
public sealed class WorkItemCommandIntegrationTests
{
    private static readonly Guid StoryId = Guid.Parse("6f0a7f0e-4d7b-4f6a-9c2e-0b3f9f2a1c01");
    private static readonly Guid AssistantId = Guid.Parse("2b1f0c3d-8e9a-4b6c-a1d2-5e6f7a8b9c02");
    private static readonly Guid AttachmentId = Guid.Parse("9c8b7a6f-5e4d-4c3b-a2f1-0e1d2c3b4a03");
    private static readonly byte[] PdfBytes = "%PDF-1.7 brief"u8.ToArray();

    [Fact]
    public async Task AttachFile_uploads_a_local_file_to_a_story_by_key()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api
            .When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Post, "/api/attachments", HttpStatusCode.Created, Attachment("planning-outcome-brief.pdf", "application/pdf", null));
        var path = cli.WriteFile("planning-outcome-brief.pdf", PdfBytes);

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path);

        Assert.Equal(0, exitCode);
        Assert.Empty(cli.Console.Errors);
        Assert.Equal(
            [$"Attached 'planning-outcome-brief.pdf' ({PdfBytes.Length} bytes, {AttachmentId}) to story 'QBC-106: Attach the brief'."],
            cli.Console.Output);

        var upload = Assert.Single(cli.Api.Requests, request => request.PathAndQuery == "/api/attachments");
        Assert.Equal("POST", upload.Method);
        Assert.Equal("Bearer test-token", upload.Authorization);
        Assert.StartsWith("multipart/form-data", upload.ContentType, StringComparison.Ordinal);
        var body = Unquoted(upload.Body);
        Assert.Contains("name=file; filename=planning-outcome-brief.pdf", body, StringComparison.Ordinal);
        Assert.Contains("Content-Type: application/pdf", body, StringComparison.Ordinal);
        Assert.Contains("%PDF-1.7 brief", body, StringComparison.Ordinal);
        Assert.Contains("name=workItemKind", body, StringComparison.Ordinal);
        Assert.Contains("Story", body, StringComparison.Ordinal);
        Assert.Contains("name=workItemId", body, StringComparison.Ordinal);
        Assert.Contains(StoryId.ToString(), body, StringComparison.Ordinal);
        Assert.DoesNotContain("uploadedByAssistantId", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AttachFile_attributes_the_upload_to_a_named_assistant()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api
            .When(HttpMethod.Get, $"/api/stories/{StoryId}", HttpStatusCode.OK, Story())
            .When(HttpMethod.Get, "/api/assistants", HttpStatusCode.OK, new[] { Assistant() })
            .When(HttpMethod.Post, "/api/attachments", HttpStatusCode.Created, Attachment("notes.md", "text/markdown", AssistantId));
        var path = cli.WriteFile("notes.md", Encoding.UTF8.GetBytes("# Notes"));

        var exitCode = await cli.InvokeAsync(
            "workitem", "attach-file", "--story-id", StoryId.ToString(), "--file", path, "--uploaded-by", "Maya Chen");

        Assert.Equal(0, exitCode);
        var upload = Assert.Single(cli.Api.Requests, request => request.PathAndQuery == "/api/attachments");
        var body = Unquoted(upload.Body);
        Assert.Contains("name=uploadedByAssistantId", body, StringComparison.Ordinal);
        Assert.Contains(AssistantId.ToString(), body, StringComparison.Ordinal);
        Assert.Contains("Content-Type: text/markdown", body, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AttachFile_refuses_an_unknown_assistant()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api
            .When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Get, "/api/assistants", HttpStatusCode.OK, Array.Empty<AssistantDto>());
        var path = cli.WriteFile("notes.md", Encoding.UTF8.GetBytes("# Notes"));

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path, "--uploaded-by", "Nobody");

        Assert.Equal(1, exitCode);
        Assert.Contains("No assistant named 'Nobody' was found.", cli.Console.Errors);
        Assert.DoesNotContain(cli.Api.Requests, request => request.PathAndQuery == "/api/attachments");
    }

    [Fact]
    public async Task AttachFile_refuses_a_program_file_before_calling_the_api()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        var path = cli.WriteFile("setup.exe", [0x4D, 0x5A]);

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path);

        Assert.Equal(1, exitCode);
        Assert.Equal(["setup.exe: Programs and scripts cannot be attached."], cli.Console.Errors);
        Assert.Empty(cli.Api.Requests);
    }

    [Fact]
    public async Task AttachFile_refuses_an_empty_file_before_calling_the_api()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        var path = cli.WriteFile("empty.pdf", []);

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path);

        Assert.Equal(1, exitCode);
        Assert.Equal(["empty.pdf: The file is empty, or is a folder. Folders have to be zipped first."], cli.Console.Errors);
        Assert.Empty(cli.Api.Requests);
    }

    [Fact]
    public async Task AttachFile_refuses_a_missing_file_before_calling_the_api()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        var path = Path.Combine(Path.GetTempPath(), "qbc-cli-missing", "brief.pdf");

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path);

        Assert.Equal(1, exitCode);
        Assert.Equal([$"brief.pdf: File '{path}' was not found."], cli.Console.Errors);
        Assert.Empty(cli.Api.Requests);
    }

    [Fact]
    public async Task AttachFile_reports_an_api_refusal()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api
            .When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(
                HttpMethod.Post,
                "/api/attachments",
                HttpStatusCode.Conflict,
                """{"type":"urn:qbc-workboard:problem:conflict","title":"Operation conflicts with current state","status":409,"detail":"'planning-outcome-brief.pdf' is already attached to this work item."}""");
        var path = cli.WriteFile("planning-outcome-brief.pdf", PdfBytes);

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", path);

        Assert.Equal(1, exitCode);
        Assert.Empty(cli.Console.Output);
        var error = Assert.Single(cli.Console.Errors);
        Assert.Contains("409", error, StringComparison.Ordinal);
        Assert.Contains("already attached", error, StringComparison.Ordinal);
    }

    [Fact]
    public async Task AttachFile_attaches_several_files_in_order()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        cli.Api
            .When(HttpMethod.Get, "/api/stories/backlog", HttpStatusCode.OK, new[] { Story() })
            .When(HttpMethod.Post, "/api/attachments", HttpStatusCode.Created, Attachment("planning-outcome-brief.pdf", "application/pdf", null));
        var first = cli.WriteFile("planning-outcome-brief.pdf", PdfBytes);
        var second = cli.WriteFile("notes.md", Encoding.UTF8.GetBytes("# Notes"));

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--story-key", "QBC-106", "--file", first, "--file", second);

        Assert.Equal(0, exitCode);
        Assert.Equal(2, cli.Console.Output.Count);
        var uploads = cli.Api.Requests.Where(request => request.PathAndQuery == "/api/attachments").ToList();
        Assert.Equal(2, uploads.Count);
        Assert.Contains("filename=planning-outcome-brief.pdf", Unquoted(uploads[0].Body), StringComparison.Ordinal);
        Assert.Contains("filename=notes.md", Unquoted(uploads[1].Body), StringComparison.Ordinal);
    }

    [Fact]
    public async Task AttachFile_requires_a_story()
    {
        using var cli = WorkboardApiCliTestHost.Create();
        var path = cli.WriteFile("planning-outcome-brief.pdf", PdfBytes);

        var exitCode = await cli.InvokeAsync("workitem", "attach-file", "--file", path);

        Assert.Equal(1, exitCode);
        Assert.Equal(["Provide --story-id or --story-key."], cli.Console.Errors);
        Assert.Empty(cli.Api.Requests);
    }

    private static StoryDto Story() => new(
        StoryId,
        "QBC-106",
        Guid.Parse("3d4e5f60-7182-4a9b-8c0d-1e2f3a4b5c06"),
        "Onboarding",
        "Client portal",
        "Attach the brief",
        string.Empty,
        string.Empty,
        null,
        null,
        null,
        StoryLifecycle.Draft,
        false,
        null,
        null,
        null,
        BoardStatus.ToDo,
        []);

    private static AssistantDto Assistant() =>
        new(AssistantId, "Maya Chen", "Product & Research", [], Availability.Available, 0, 0, []);

    private static AttachmentDto Attachment(string fileName, string contentType, Guid? uploadedByAssistantId) => new(
        AttachmentId,
        WorkItemKind.Story,
        StoryId,
        fileName,
        contentType,
        PdfBytes.Length,
        uploadedByAssistantId,
        uploadedByAssistantId is null ? null : "Maya Chen",
        DateTimeOffset.UtcNow);

    /// <summary>
    /// Multipart headers may quote parameter values; the assertions care about names, not quoting.
    /// </summary>
    private static string Unquoted(string body) => body.Replace("\"", string.Empty, StringComparison.Ordinal);
}
