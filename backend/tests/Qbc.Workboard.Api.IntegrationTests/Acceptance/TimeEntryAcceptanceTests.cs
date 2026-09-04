using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class TimeEntryAcceptanceTests : AcceptanceTest
{
    private static readonly DateOnly Worked = new(2026, 8, 31);

    [Fact]
    public async Task L2_050_Log_hours_against_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);

        var response = await Client.PostAsJsonAsync(
            "/api/time-entries",
            new TimeEntryRequest(story.Id, assistant.Id, Worked, 2.5m, "  Sketched the summary card  "));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var entry = await response.Content.ReadFromJsonAsync<TimeEntryDto>(Workspace.Json);
        Assert.NotNull(entry);
        Assert.NotEqual(Guid.Empty, entry.Id);
        Assert.Equal(story.Id, entry.StoryId);
        Assert.Equal(assistant.Id, entry.AssistantId);
        Assert.Equal(Worked, entry.WorkedOn);
        Assert.Equal(2.5m, entry.Hours);
        Assert.Equal("Sketched the summary card", entry.Note);

        // The entry is attributed to the assistant it named, and counts toward their totals.
        var hours = await Given.ReadAssistantHoursAsync(assistant.Id);
        Assert.Equal(2.5m, hours.HoursLogged);
        Assert.Equal(story.Id, Assert.Single(hours.Stories).StoryId);
    }

    [Fact]
    public async Task L2_050_Reject_an_invalid_entry()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);

        // Quarter hours are the increment the product records, so 0.25 and 2.5 are accepted.
        foreach (var accepted in new[] { 0.25m, 2.5m, 8m, 24m })
        {
            var logged = await Given.LogTimeAsync(story.Id, assistant.Id, hours: accepted);
            Assert.Equal(accepted, logged.Hours);
        }

        foreach (var rejected in new[] { 0m, -1m, 24.25m, 1.1m, 0.3m })
        {
            var response = await Client.PostAsJsonAsync(
                "/api/time-entries",
                new TimeEntryRequest(story.Id, assistant.Id, Worked, rejected, string.Empty));
            await ExpectInvalidFieldsAsync(response, "hours");
        }

        await ExpectInvalidFieldsAsync(
            await Client.PostAsJsonAsync(
                "/api/time-entries",
                new TimeEntryRequest(story.Id, assistant.Id, null, 1m, string.Empty)),
            "workedOn");

        // Nothing was written on the way to any of those refusals: only the four accepted amounts.
        Assert.Equal(34.75m, (await Given.ReadAssistantHoursAsync(assistant.Id)).HoursLogged);
    }

    [Fact]
    public async Task L2_050_Reject_an_entry_against_an_unknown_story_or_assistant()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        var missing = Guid.NewGuid();

        await ExpectProblemAsync(
            await Client.PostAsJsonAsync(
                "/api/time-entries",
                new TimeEntryRequest(missing, assistant.Id, Worked, 1m, string.Empty)),
            HttpStatusCode.NotFound,
            "not-found");
        await ExpectProblemAsync(
            await Client.PostAsJsonAsync(
                "/api/time-entries",
                new TimeEntryRequest(story.Id, missing, Worked, 1m, string.Empty)),
            HttpStatusCode.NotFound,
            "not-found");

        Assert.Equal(0m, (await Given.ReadAssistantHoursAsync(assistant.Id)).HoursLogged);
    }

    [Fact]
    public async Task L2_050_Delete_an_entry()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        var kept = await Given.LogTimeAsync(story.Id, assistant.Id, hours: 3m);
        var mistake = await Given.LogTimeAsync(story.Id, assistant.Id, hours: 5m);
        Assert.Equal(8m, (await Given.ReadAssistantHoursAsync(assistant.Id)).HoursLogged);

        Assert.Equal(
            HttpStatusCode.NoContent,
            (await Client.DeleteAsync($"/api/time-entries/{mistake.Id}")).StatusCode);

        var hours = await Given.ReadAssistantHoursAsync(assistant.Id);
        Assert.Equal(3m, hours.HoursLogged);
        Assert.Equal(kept.Id, Assert.Single(Assert.Single(hours.Stories).Entries).Id);

        // An entry that is already gone is reported as missing rather than deleted twice.
        await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/time-entries/{mistake.Id}"),
            HttpStatusCode.NotFound,
            "not-found");
    }

    [Fact]
    public async Task L2_050_Protect_an_assistant_with_logged_hours()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var story = await Given.AddGroomableStoryAsync(epic.Id);
        var entry = await Given.LogTimeAsync(story.Id, assistant.Id, hours: 4m);

        // The assistant owns no story and no task, so only the logged hours stand in the way.
        var problem = await ExpectProblemAsync(
            await Client.DeleteAsync($"/api/assistants/{assistant.Id}"),
            HttpStatusCode.Conflict,
            "conflict");
        var blocking = problem.GetProperty("blockingAssignments").EnumerateArray().ToList();
        Assert.Equal(story.Key, Assert.Single(blocking).GetProperty("storyKey").GetString());

        // Removing the hours removes the obstacle.
        Assert.Equal(
            HttpStatusCode.NoContent,
            (await Client.DeleteAsync($"/api/time-entries/{entry.Id}")).StatusCode);
        Assert.Equal(
            HttpStatusCode.NoContent,
            (await Client.DeleteAsync($"/api/assistants/{assistant.Id}")).StatusCode);
    }

    [Fact]
    public async Task L2_051_Open_an_assistants_hours()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync("Noah Williams", "Software Development Assistant");
        var (done, inFlight) = await Given.AddSprintWithDoneAndInFlightStoriesAsync(epic.Id);
        await Given.LogTimeAsync(done.Id, assistant.Id, hours: 6m);
        await Given.LogTimeAsync(inFlight.Id, assistant.Id, hours: 3.5m);

        var hours = await Given.ReadAssistantHoursAsync(assistant.Id);

        Assert.Equal(assistant.Id, hours.AssistantId);
        Assert.Equal("Noah Williams", hours.FullName);
        Assert.Equal("Software Development Assistant", hours.Role);
        Assert.Equal(9.5m, hours.HoursLogged);
        Assert.Equal(6m, hours.HoursOnCompletedStories);
        Assert.Equal(2, hours.StoriesWorkedOn);
        Assert.Equal(1, hours.CompletedStoriesWorkedOn);
    }

    [Fact]
    public async Task L2_051_Trace_hours_to_completed_stories()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var assistant = await Given.AddAssistantAsync();
        var (done, inFlight) = await Given.AddSprintWithDoneAndInFlightStoriesAsync(epic.Id);
        await Given.LogTimeAsync(done.Id, assistant.Id, hours: 7m);
        await Given.LogTimeAsync(inFlight.Id, assistant.Id, hours: 5m);

        var hours = await Given.ReadAssistantHoursAsync(assistant.Id);

        Assert.Equal(12m, hours.HoursLogged);
        Assert.Equal(7m, hours.HoursOnCompletedStories);
        Assert.True(hours.HoursOnCompletedStories <= hours.HoursLogged);
        Assert.True(Assert.Single(hours.Stories, story => story.StoryId == done.Id).IsComplete);
        Assert.False(Assert.Single(hours.Stories, story => story.StoryId == inFlight.Id).IsComplete);

        // Completion is read now rather than recorded, so moving a story off Done moves its hours too.
        await Given.MoveAsync(done.Id, BoardStatus.InProgress);
        var reread = await Given.ReadAssistantHoursAsync(assistant.Id);
        Assert.Equal(12m, reread.HoursLogged);
        Assert.Equal(0m, reread.HoursOnCompletedStories);
        Assert.Equal(0, reread.CompletedStoriesWorkedOn);
    }

    [Fact]
    public async Task L2_051_Read_the_entries_behind_a_story()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var noah = await Given.AddAssistantAsync("Noah Williams", "Software Development Assistant");
        var maya = await Given.AddAssistantAsync("Maya Chen", "Product and Research Assistant");
        var story = await Given.AddGroomableStoryAsync(epic.Id, "Publish an engagement health summary");
        await Given.LogTimeAsync(story.Id, noah.Id, new DateOnly(2026, 8, 30), 4m, "Built the card");
        await Given.LogTimeAsync(story.Id, noah.Id, new DateOnly(2026, 8, 31), 2.5m, "Wired the totals");
        await Given.LogTimeAsync(story.Id, maya.Id, new DateOnly(2026, 8, 31), 1.5m, "Reviewed the language");

        var listed = Assert.Single((await Given.ReadAssistantHoursAsync(noah.Id)).Stories);

        Assert.Equal(story.Key, listed.StoryKey);
        Assert.Equal("Publish an engagement health summary", listed.Title);
        // The reader's own share is reported apart from every hour logged against the story.
        Assert.Equal(6.5m, listed.Hours);
        Assert.Equal(8m, listed.StoryHours);
        Assert.Equal(
            [new DateOnly(2026, 8, 30), new DateOnly(2026, 8, 31)],
            listed.Entries.Select(entry => entry.WorkedOn));
        Assert.Equal(["Built the card", "Wired the totals"], listed.Entries.Select(entry => entry.Note));
        Assert.All(listed.Entries, entry => Assert.Equal(noah.Id, entry.AssistantId));
    }

    [Fact]
    public async Task L2_051_Guide_an_assistant_with_no_logged_hours()
    {
        var assistant = await Given.AddAssistantAsync();

        var hours = await Given.ReadAssistantHoursAsync(assistant.Id);

        Assert.Equal(assistant.Id, hours.AssistantId);
        Assert.Equal(0m, hours.HoursLogged);
        Assert.Equal(0m, hours.HoursOnCompletedStories);
        Assert.Equal(0, hours.StoriesWorkedOn);
        Assert.Equal(0, hours.CompletedStoriesWorkedOn);
        Assert.Empty(hours.Stories);

        // An assistant who does not exist has no hours to report.
        await ExpectProblemAsync(
            await Client.GetAsync($"/api/assistants/{Guid.NewGuid()}/hours"),
            HttpStatusCode.NotFound,
            "not-found");
    }
}
