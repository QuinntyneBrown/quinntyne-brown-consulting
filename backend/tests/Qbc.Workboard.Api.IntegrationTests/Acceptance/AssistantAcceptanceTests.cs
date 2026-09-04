using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class AssistantAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_009_Create_an_assistant()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/assistants",
            new AssistantRequest("Jordan Adeyemi", "Delivery assurance assistant", ["Quality", "Testing"], Availability.Limited));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<AssistantDto>(Workspace.Json);
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created.Id);

        var listed = Assert.Single(
            (await Client.GetFromJsonAsync<IReadOnlyList<AssistantDto>>("/api/assistants", Workspace.Json))!);
        Assert.Equal("Jordan Adeyemi", listed.FullName);
        Assert.Equal("Delivery assurance assistant", listed.Role);
        Assert.Equal(["Quality", "Testing"], listed.Specialties);
        Assert.Equal(Availability.Limited, listed.Availability);
    }

    [Fact]
    public async Task L2_009_View_assistant_workload()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        await Given.AddGroomableStoryAsync(
            epic.Id,
            "Publish an engagement health summary",
            5,
            assistant.Id,
            [
                new StoryTaskRequest(null, "Draft the summary", true, assistant.Id),
                new StoryTaskRequest(null, "Validate the status", false, assistant.Id)
            ]);
        await Given.AddGroomableStoryAsync(epic.Id, "Capture a client decision", 3, assistant.Id);
        var archived = await Given.AddGroomableStoryAsync(epic.Id, "Retire the worksheet", 1, assistant.Id);
        await Given.ArchiveAsync(archived.Id);

        var read = await Given.ReadAssistantAsync(assistant.Id);

        // Owned stories exclude archived work; only incomplete tasks count as open.
        Assert.Equal(2, read.StoryCount);
        Assert.Equal(1, read.IncompleteTaskCount);
    }

    [Fact]
    public async Task L2_009_Update_an_assistant()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id, assistantId: assistant.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/assistants/{assistant.Id}",
            new AssistantRequest(
                "Maya Chen-Alvarez",
                "Principal delivery assistant",
                ["Discovery", "Delivery", "Facilitation"],
                Availability.Unavailable));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await Given.ReadAssistantAsync(assistant.Id);
        Assert.Equal("Maya Chen-Alvarez", updated.FullName);
        Assert.Equal("Principal delivery assistant", updated.Role);
        Assert.Equal(["Discovery", "Delivery", "Facilitation"], updated.Specialties);
        Assert.Equal(Availability.Unavailable, updated.Availability);

        // The new identity reaches the work the assistant owns.
        Assert.Equal("Maya Chen-Alvarez", (await Given.ReadStoryAsync(story.Id)).AssistantName);
    }

    [Fact]
    public async Task L2_009_Delete_an_unassigned_assistant()
    {
        var assistant = await Given.AddAssistantAsync("Priya Raman", "Research assistant");

        var response = await Client.DeleteAsync($"/api/assistants/{assistant.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/assistants/{assistant.Id}")).StatusCode);
        Assert.Empty((await Client.GetFromJsonAsync<IReadOnlyList<AssistantDto>>("/api/assistants", Workspace.Json))!);
    }

    [Fact]
    public async Task L2_010_Assign_an_assistant()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var owner = await Given.AddAssistantAsync();
        var helper = await Given.AddAssistantAsync("Noah Williams", "Software development assistant");

        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            assistantId: owner.Id,
            tasks: [new StoryTaskRequest(null, "Review the canvas", false, helper.Id)]);

        var persisted = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(owner.Id, persisted.AssistantId);
        Assert.Equal("Maya Chen", persisted.AssistantName);
        var task = Assert.Single(persisted.Tasks);
        Assert.Equal(helper.Id, task.AssistantId);
        Assert.Equal("Noah Williams", task.AssistantName);
    }

    [Fact]
    public async Task L2_010_Unassign_work()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(
            epic.Id,
            assistantId: assistant.Id,
            tasks: [new StoryTaskRequest(null, "Draft the summary", false, assistant.Id)]);
        var task = Assert.Single(story.Tasks);

        var response = await Client.PutAsJsonAsync(
            $"/api/stories/{story.Id}",
            new StoryRequest(
                story.EpicId,
                story.Title,
                story.Description,
                story.AcceptanceCriteria,
                story.Points,
                null,
                [new StoryTaskRequest(task.Id, task.Title, task.IsComplete, null)]));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var unassigned = await Given.ReadStoryAsync(story.Id);
        Assert.Null(unassigned.AssistantId);
        Assert.Null(Assert.Single(unassigned.Tasks).AssistantId);

        // Neither record was deleted; only the assignment went away.
        Assert.Equal("Publish an engagement health summary", unassigned.Title);
        var directory = await Given.ReadAssistantAsync(assistant.Id);
        Assert.Equal(0, directory.StoryCount);
        Assert.Equal(0, directory.IncompleteTaskCount);
    }

    [Fact]
    public async Task L2_010_Protect_an_assigned_assistant()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var owned = await Given.AddGroomableStoryAsync(
            epic.Id,
            "Publish an engagement health summary",
            5,
            assistant.Id,
            [new StoryTaskRequest(null, "Draft the summary", false, assistant.Id)]);
        var elsewhere = await Given.AddGroomableStoryAsync(
            epic.Id,
            "Capture a client decision",
            3,
            null,
            [new StoryTaskRequest(null, "Confirm the decision format", false, assistant.Id)]);

        var response = await Client.DeleteAsync($"/api/assistants/{assistant.Id}");

        var problem = await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        var assignments = JsonSerializer.Deserialize<IReadOnlyList<AssignmentLinkDto>>(
            problem.GetProperty("blockingAssignments").GetRawText(),
            Workspace.Json)!;

        // Every blocking story and task is listed, each naming the story it can be reassigned from.
        Assert.Equal(3, assignments.Count);
        Assert.Contains(assignments, item => item.StoryId == owned.Id && item.TaskId is null);
        Assert.Contains(assignments, item => item.StoryId == owned.Id && item.TaskId is not null);
        Assert.Contains(assignments, item => item.StoryId == elsewhere.Id && item.TaskId is not null);
        Assert.All(assignments, item => Assert.StartsWith("QBC-", item.StoryKey, StringComparison.Ordinal));

        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/assistants/{assistant.Id}")).StatusCode);
    }

    [Fact]
    public async Task L2_010_Protect_an_assistant_whose_only_work_is_archived()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id, assistantId: assistant.Id);
        await Given.ArchiveAsync(story.Id);

        // The assistant still owns the archived story, so deleting them would orphan it.
        var response = await Client.DeleteAsync($"/api/assistants/{assistant.Id}");

        await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/api/assistants/{assistant.Id}")).StatusCode);
    }
}
