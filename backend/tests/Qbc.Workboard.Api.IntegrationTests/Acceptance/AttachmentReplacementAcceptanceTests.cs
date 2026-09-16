using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Qbc.Workboard.Infrastructure.Persistence;
using Qbc.Workboard.Application.Common.Exceptions;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

// Traces to L2-055: replacements retain identity and reject stale or invalid writes.
public sealed class AttachmentReplacementAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_055_Replace_preserves_identity_and_rejects_stale_revision()
    {
        var initiative = await Given.AddInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var original = await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "resume.pdf", "old"u8.ToArray(), assistantId: assistant.Id);
        using var form = Form("new resume"u8.ToArray(), "0");
        var response = await Client.PutAsync($"/api/attachments/{original.Id}/content", form);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(1, result.GetProperty("revision").GetInt32());
        Assert.Equal(original.Id, result.GetProperty("id").GetGuid());
        Assert.Equal(initiative.Id, result.GetProperty("workItemId").GetGuid());
        Assert.Equal(assistant.Id, result.GetProperty("uploadedByAssistantId").GetGuid());
        Assert.Equal(10, result.GetProperty("sizeInBytes").GetInt32());
        Assert.Equal(original.UploadedOn, result.GetProperty("uploadedOn").GetDateTimeOffset());
        Assert.Equal("resume.pdf", result.GetProperty("fileName").GetString());
        Assert.Equal("new resume", await Client.GetStringAsync($"/api/attachments/{original.Id}/content"));
        using var stale = Form("stale"u8.ToArray(), "0");
        Assert.Equal(HttpStatusCode.Conflict, (await Client.PutAsync($"/api/attachments/{original.Id}/content", stale)).StatusCode);
        Assert.Equal("new resume", await Client.GetStringAsync($"/api/attachments/{original.Id}/content"));
        Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
    }

    [Theory]
    [InlineData("resume.pdf", "0", true)]
    [InlineData("resume.docx", "0", false)]
    [InlineData("resume.pdf", "-1", false)]
    [InlineData("resume.pdf", null, false)]
    public async Task L2_055_Invalid_replacement_leaves_original(string fileName, string? revision, bool empty)
    {
        var initiative = await Given.AddInitiativeAsync();
        var original = await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "resume.pdf", "old"u8.ToArray());
        using var form = Form(empty ? [] : "new"u8.ToArray(), revision, fileName);
        var response = await Client.PutAsync($"/api/attachments/{original.Id}/content", form);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("old", await Client.GetStringAsync($"/api/attachments/{original.Id}/content"));
    }

    private static MultipartFormDataContent Form(byte[] bytes, string? revision, string name = "resume.pdf")
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new("application/pdf");
        var form = new MultipartFormDataContent { { file, "file", name } };
        if (revision is not null) form.Add(new StringContent(revision), "expectedRevision");
        return form;
    }

    [Fact]
    public async Task L2_055_Conflicting_unit_of_work_rolls_back_content_and_metadata()
    {
        var initiative = await Given.AddInitiativeAsync();
        var original = await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "resume.pdf", "old"u8.ToArray());
        using var scope1 = Factory.Services.CreateScope();
        using var scope2 = Factory.Services.CreateScope();
        var first = scope1.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        var second = scope2.ServiceProvider.GetRequiredService<WorkboardDbContext>();
        var a = await first.Attachments.SingleAsync(item => item.Id == original.Id);
        var b = await second.Attachments.SingleAsync(item => item.Id == original.Id);
        var ac = await first.AttachmentContents.SingleAsync(item => item.AttachmentId == original.Id);
        var bc = await second.AttachmentContents.SingleAsync(item => item.AttachmentId == original.Id);
        a.ReplaceContent("application/pdf", 5);
        ac.Replace("first"u8.ToArray());
        b.ReplaceContent("application/pdf", 6);
        bc.Replace("second"u8.ToArray());
        await first.SaveChangesAsync();
        await Assert.ThrowsAsync<ConflictException>(() => second.SaveChangesAsync());
        Assert.Equal("first", await Client.GetStringAsync($"/api/attachments/{original.Id}/content"));
        var metadata = Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
        Assert.Equal(1, metadata.Revision);
        Assert.Equal(5, metadata.SizeInBytes);
    }

    [Fact]
    public async Task L2_055_Unknown_attachment_is_not_found()
    {
        using var form = Form("new"u8.ToArray(), "0");
        Assert.Equal(HttpStatusCode.NotFound, (await Client.PutAsync($"/api/attachments/{Guid.NewGuid()}/content", form)).StatusCode);
    }

    [Fact]
    public async Task L2_055_Unauthenticated_replacement_is_refused()
    {
        Client.DefaultRequestHeaders.Authorization = null;
        using var form = Form("new"u8.ToArray(), "0");
        Assert.Equal(HttpStatusCode.Unauthorized, (await Client.PutAsync($"/api/attachments/{Guid.NewGuid()}/content", form)).StatusCode);
    }
}
