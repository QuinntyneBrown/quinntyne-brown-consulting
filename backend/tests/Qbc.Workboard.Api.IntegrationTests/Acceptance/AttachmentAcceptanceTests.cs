using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class AttachmentAcceptanceTests : AcceptanceTest
{
    private static readonly byte[] Brief = [0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37];

    [Fact]
    public async Task L2_052_Attach_a_file_to_a_work_item()
    {
        var initiative = await Given.AddInitiativeAsync();

        var attachment = await Given.AttachFileAsync(
            WorkItemKind.Initiative,
            initiative.Id,
            "  planning-outcome-brief.pdf  ",
            Brief);

        Assert.NotEqual(Guid.Empty, attachment.Id);
        Assert.Equal(WorkItemKind.Initiative, attachment.WorkItemKind);
        Assert.Equal(initiative.Id, attachment.WorkItemId);
        Assert.Equal("planning-outcome-brief.pdf", attachment.FileName);
        Assert.Equal("application/pdf", attachment.ContentType);
        Assert.Equal(Brief.Length, attachment.SizeInBytes);

        var listed = Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
        Assert.Equal(attachment.Id, listed.Id);
    }

    [Fact]
    public async Task L2_052_Attribute_an_attachment_to_an_assistant()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();

        var attributed = await Given.AttachFileAsync(
            WorkItemKind.Epic,
            epic.Id,
            "portal-wireframes.pdf",
            assistantId: assistant.Id);

        Assert.Equal(assistant.Id, attributed.UploadedByAssistantId);
        Assert.Equal("Maya Chen", attributed.UploadedBy);

        // The attribution is optional, so a file arriving without one is held rather than refused.
        var anonymous = await Given.AttachFileAsync(WorkItemKind.Epic, epic.Id, "client-feedback.docx");

        Assert.Null(anonymous.UploadedByAssistantId);
        Assert.Null(anonymous.UploadedBy);
    }

    [Fact]
    public async Task L2_052_Refuse_an_empty_file()
    {
        var initiative = await Given.AddInitiativeAsync();

        var response = await Given.AttachAsync(WorkItemKind.Initiative, initiative.Id, "empty-folder", []);

        await ExpectInvalidFieldsAsync(response, "file");
        Assert.Empty(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
    }

    [Fact]
    public async Task L2_052_Refuse_a_file_over_the_size_limit()
    {
        var initiative = await Given.AddInitiativeAsync();

        // One byte past the published limit, so the refusal is the limit and nothing else.
        var oversized = new byte[(25 * 1024 * 1024) + 1];
        var response = await Given.AttachAsync(WorkItemKind.Initiative, initiative.Id, "recording.mp4", oversized);

        await ExpectInvalidFieldsAsync(response, "file");
        Assert.Empty(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));

        // The largest acceptable file is still accepted, so the boundary is inclusive.
        var atTheLimit = await Given.AttachFileAsync(
            WorkItemKind.Initiative,
            initiative.Id,
            "capacity-model.xlsx",
            new byte[25 * 1024 * 1024]);

        Assert.Equal(25 * 1024 * 1024, atTheLimit.SizeInBytes);
    }

    [Fact]
    public async Task L2_052_Refuse_a_program_file()
    {
        var initiative = await Given.AddInitiativeAsync();

        foreach (var name in new[] { "setup.exe", "run.bat", "install.msi", "deploy.ps1", "tool.JAR" })
        {
            var response = await Given.AttachAsync(WorkItemKind.Initiative, initiative.Id, name, Brief);
            await ExpectInvalidFieldsAsync(response, "file");
        }

        Assert.Empty(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
    }

    [Fact]
    public async Task L2_052_Refuse_a_name_already_attached_here()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        await Given.AttachFileAsync(WorkItemKind.Story, story.Id, "signal-definitions.md", Brief);

        // The product versions no attachment, so the second file of that name is turned away.
        var response = await Given.AttachAsync(WorkItemKind.Story, story.Id, "SIGNAL-DEFINITIONS.md", Brief);

        await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Story, story.Id));

        // The same name is free on every other work item, because a list belongs to one work item.
        var elsewhere = await Given.AttachFileAsync(WorkItemKind.Epic, epic.Id, "signal-definitions.md", Brief);
        Assert.Equal("signal-definitions.md", elsewhere.FileName);
    }

    [Fact]
    public async Task L2_052_Refuse_an_attachment_against_an_unknown_work_item()
    {
        var response = await Given.AttachAsync(WorkItemKind.Story, Guid.NewGuid(), "brief.pdf", Brief);

        await ExpectProblemAsync(response, HttpStatusCode.NotFound, "not-found");
    }

    [Fact]
    public async Task L2_052_Retrieve_an_attached_file()
    {
        var initiative = await Given.AddInitiativeAsync();
        var attachment = await Given.AttachFileAsync(
            WorkItemKind.Initiative,
            initiative.Id,
            "planning-outcome-brief.pdf",
            Brief);

        var response = await Client.GetAsync($"/api/attachments/{attachment.Id}/content");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(Brief, await response.Content.ReadAsByteArrayAsync());
        Assert.Equal("application/pdf", response.Content.Headers.ContentType?.MediaType);

        // Naming the file forces a download, so an uploaded document never renders in this origin.
        Assert.Equal("attachment", response.Content.Headers.ContentDisposition?.DispositionType);
        Assert.Equal("planning-outcome-brief.pdf", response.Content.Headers.ContentDisposition?.FileName?.Trim('"'));
    }

    [Fact]
    public async Task L2_052_Remove_an_attachment()
    {
        var initiative = await Given.AddInitiativeAsync();
        var attachment = await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "brief.pdf", Brief);

        var removed = await Client.DeleteAsync($"/api/attachments/{attachment.Id}");

        Assert.Equal(HttpStatusCode.NoContent, removed.StatusCode);
        Assert.Empty(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/attachments/{attachment.Id}/content")).StatusCode);

        // The name it held is free again, which is the difference between removal and versioning.
        var replacement = await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "brief.pdf", Brief);
        Assert.Equal("brief.pdf", replacement.FileName);
    }

    [Fact]
    public async Task L2_052_Keep_a_work_items_files_to_itself()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);
        var story = await Given.AddGroomableStoryAsync(epic.Id);

        await Given.AttachFileAsync(WorkItemKind.Initiative, initiative.Id, "initiative-brief.pdf", Brief);
        await Given.AttachFileAsync(WorkItemKind.Epic, epic.Id, "epic-wireframes.pdf", Brief);
        await Given.AttachFileAsync(WorkItemKind.Story, story.Id, "story-screenshot.png", Brief);

        // No inheritance in either direction: each level reports the file attached to it and no other.
        Assert.Equal(
            "initiative-brief.pdf",
            Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id)).FileName);
        Assert.Equal(
            "epic-wireframes.pdf",
            Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Epic, epic.Id)).FileName);
        Assert.Equal(
            "story-screenshot.png",
            Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Story, story.Id)).FileName);
    }

    [Fact]
    public async Task L2_052_Discard_attachments_with_their_work_item()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        var attachment = await Given.AttachFileAsync(WorkItemKind.Story, story.Id, "story-screenshot.png", Brief);

        var deleted = await Client.DeleteAsync($"/api/stories/{story.Id}");

        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/attachments/{attachment.Id}/content")).StatusCode);
    }

    [Fact]
    public async Task L2_052_Keep_a_file_whose_uploader_is_deleted()
    {
        var initiative = await Given.AddInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var attachment = await Given.AttachFileAsync(
            WorkItemKind.Initiative,
            initiative.Id,
            "capacity-model.xlsx",
            assistantId: assistant.Id);

        // The attribution is optional, so it cannot be the thing that keeps an assistant alive.
        var deleted = await Client.DeleteAsync($"/api/assistants/{assistant.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleted.StatusCode);

        var kept = Assert.Single(await Given.ReadAttachmentsAsync(WorkItemKind.Initiative, initiative.Id));
        Assert.Equal(attachment.Id, kept.Id);
        Assert.Null(kept.UploadedByAssistantId);
        Assert.Null(kept.UploadedBy);
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/attachments/{kept.Id}/content")).StatusCode);
    }
}
