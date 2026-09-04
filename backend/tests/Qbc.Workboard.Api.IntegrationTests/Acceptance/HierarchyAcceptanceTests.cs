using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

public sealed class HierarchyAcceptanceTests : AcceptanceTest
{
    [Fact]
    public async Task L2_002_Create_an_initiative()
    {
        var response = await Client.PostAsJsonAsync(
            "/api/initiatives",
            new InitiativeRequest("Sustainable delivery economics", "Make every engagement profitable."));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<InitiativeDto>(Workspace.Json);
        Assert.NotNull(created);
        Assert.NotEqual(Guid.Empty, created.Id);

        var hierarchy = await Given.ReadHierarchyAsync();
        var initiative = Assert.Single(hierarchy.Initiatives);
        Assert.Equal("Sustainable delivery economics", initiative.Name);
        Assert.Equal("Make every engagement profitable.", initiative.Description);
    }

    [Fact]
    public async Task L2_002_Reject_an_invalid_initiative()
    {
        var response = await Client.PostAsJsonAsync("/api/initiatives", new InitiativeRequest("  ", string.Empty));

        await ExpectInvalidFieldsAsync(response, "name", "description");
        Assert.Empty((await Given.ReadHierarchyAsync()).Initiatives);
    }

    [Fact]
    public async Task L2_002_Update_an_initiative()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);
        await Given.AddDraftStoryAsync(epic.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/initiatives/{initiative.Id}",
            new InitiativeRequest("Renamed outcome", "A corrected outcome description."));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var hierarchy = await Given.ReadHierarchyAsync();
        Assert.Equal("Renamed outcome", Assert.Single(hierarchy.Initiatives).Name);

        // The new name reaches every projection that names the initiative.
        var story = Assert.Single(await Given.ReadBacklogAsync());
        Assert.Equal("Renamed outcome", story.InitiativeName);
    }

    [Fact]
    public async Task L2_002_Delete_an_empty_initiative()
    {
        var initiative = await Given.AddInitiativeAsync();

        var response = await Client.DeleteAsync($"/api/initiatives/{initiative.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty((await Given.ReadHierarchyAsync()).Initiatives);
        Assert.Equal(
            HttpStatusCode.NotFound,
            (await Client.GetAsync($"/api/initiatives/{initiative.Id}")).StatusCode);
    }

    [Fact]
    public async Task L2_002_Protect_an_initiative_with_epics()
    {
        var initiative = await Given.AddInitiativeAsync();
        await Given.AddEpicAsync(initiative.Id);

        var response = await Client.DeleteAsync($"/api/initiatives/{initiative.Id}");

        var problem = await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Contains("epics", problem.GetProperty("detail").GetString(), StringComparison.OrdinalIgnoreCase);
        Assert.Single((await Given.ReadHierarchyAsync()).Initiatives);
    }

    [Fact]
    public async Task L2_003_Create_an_epic()
    {
        var initiative = await Given.AddInitiativeAsync();

        var response = await Client.PostAsJsonAsync(
            "/api/epics",
            new EpicRequest(initiative.Id, "Engagement margin insight", "Show where an engagement earns."));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var hierarchy = await Given.ReadHierarchyAsync();
        var epic = Assert.Single(Assert.Single(hierarchy.Initiatives).Epics);
        Assert.Equal("Engagement margin insight", epic.Name);
        Assert.Equal("Show where an engagement earns.", epic.Summary);
    }

    [Fact]
    public async Task L2_003_Update_or_move_an_epic()
    {
        var origin = await Given.AddInitiativeAsync("Applied AI advantage", "Turn experiments into value.");
        var destination = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(origin.Id, "Engagement copilot", "Support teams with AI.");
        var story = await Given.AddDraftStoryAsync(epic.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/epics/{epic.Id}",
            new EpicRequest(destination.Id, "Engagement margin insight", "Show where an engagement earns."));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var hierarchy = await Given.ReadHierarchyAsync();
        Assert.Empty(hierarchy.Initiatives.Single(item => item.Id == origin.Id).Epics);
        var moved = Assert.Single(hierarchy.Initiatives.Single(item => item.Id == destination.Id).Epics);
        Assert.Equal("Engagement margin insight", moved.Name);
        Assert.Equal("Show where an engagement earns.", moved.Summary);

        // The move carries the epic's stories with it rather than orphaning them.
        var linked = await Given.ReadStoryAsync(story.Id);
        Assert.Equal(epic.Id, linked.EpicId);
        Assert.Equal("Engagement margin insight", linked.EpicName);
        Assert.Equal(destination.Name, linked.InitiativeName);
    }

    [Fact]
    public async Task L2_003_Delete_an_empty_epic()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);

        var response = await Client.DeleteAsync($"/api/epics/{epic.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Empty(Assert.Single((await Given.ReadHierarchyAsync()).Initiatives).Epics);
    }

    [Fact]
    public async Task L2_003_Protect_an_epic_with_stories()
    {
        var epic = await Given.AddEpicWithInitiativeAsync();
        var story = await Given.AddDraftStoryAsync(epic.Id);
        await Given.ArchiveAsync(story.Id);

        // An archived story still counts: the epic is not empty.
        var response = await Client.DeleteAsync($"/api/epics/{epic.Id}");

        var problem = await ExpectProblemAsync(response, HttpStatusCode.Conflict, "conflict");
        Assert.Contains("stories", problem.GetProperty("detail").GetString(), StringComparison.OrdinalIgnoreCase);
        Assert.Single(Assert.Single((await Given.ReadHierarchyAsync()).Initiatives).Epics);
    }

    [Fact]
    public async Task L2_003_Reject_an_invalid_epic()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/epics/{epic.Id}",
            new EpicRequest(initiative.Id, "  ", "  \n  \n "));

        await ExpectInvalidFieldsAsync(response, "name", "summary");
        Assert.Equal("Give clients a clear view of outcomes.", (await Given.ReadEpicAsync(epic.Id)).Summary);
    }

    [Fact]
    public async Task L2_003_Reject_an_oversized_summary()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/epics/{epic.Id}",
            new EpicRequest(initiative.Id, "Engagement margin insight", new string('a', 100_001)));

        await ExpectInvalidFieldsAsync(response, "summary");
        Assert.Equal("Give clients a clear view of outcomes.", (await Given.ReadEpicAsync(epic.Id)).Summary);
    }

    [Fact]
    public async Task L2_049_Preserve_markdown_structure()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id, "Client delivery portal", MarkdownBrief);

        // A second application over the same store, as a redeployment would be.
        using var restarted = Factory.Restart();
        using var client = restarted.CreateUnlockedClient();

        var reread = await new Workspace(client).ReadEpicAsync(epic.Id);

        // Every structural line survives: no collapsing, escaping, or re-wrapping.
        Assert.Equal(MarkdownBrief.Split('\n'), reread.Summary.Split('\n'));
        Assert.Equal(initiative.Id, reread.InitiativeId);
    }

    [Fact]
    public async Task L2_004_View_hierarchy_roll_ups()
    {
        var initiative = await Given.AddInitiativeAsync();
        var portal = await Given.AddEpicAsync(initiative.Id, "Client delivery portal", "A clear view of outcomes.");
        var playbook = await Given.AddEpicAsync(initiative.Id, "Delivery playbook", "Standardize the practices.");
        var other = await Given.AddInitiativeAsync("Applied AI advantage", "Turn experiments into value.");
        await Given.AddEpicAsync(other.Id, "Engagement copilot", "Support teams with AI.");

        var sprint = await Given.AddSprintAsync();
        var done = await Given.AddReadyStoryAsync(playbook.Id, "Create a weekly delivery checklist", 2);
        await Given.PlanAsync(sprint.Id, done.Id);
        await Given.StartAsync(sprint.Id);
        await Given.MoveAsync(done.Id, BoardStatus.Done);
        await Given.AddDraftStoryAsync(playbook.Id, "Draft an escalation path");
        await Given.AddDraftStoryAsync(portal.Id, "Share milestone notes");
        var archived = await Given.AddDraftStoryAsync(portal.Id, "Retire the legacy worksheet");
        await Given.ArchiveAsync(archived.Id);

        var hierarchy = await Given.ReadHierarchyAsync();

        var owner = hierarchy.Initiatives.Single(item => item.Id == initiative.Id);
        Assert.Equal(2, owner.EpicCount);
        // The archived story is excluded: roll-ups describe current work.
        Assert.Equal(3, owner.StoryCount);

        var portalRollUp = owner.Epics.Single(item => item.Id == portal.Id);
        Assert.Equal(1, portalRollUp.StoryCount);
        Assert.Equal(0, portalRollUp.CompletionPercentage);

        var playbookRollUp = owner.Epics.Single(item => item.Id == playbook.Id);
        Assert.Equal(2, playbookRollUp.StoryCount);
        Assert.Equal(50, playbookRollUp.CompletionPercentage);

        // Every epic is reported beneath exactly one initiative.
        Assert.DoesNotContain(
            hierarchy.Initiatives.Single(item => item.Id == other.Id).Epics,
            item => item.Id == portal.Id);
        Assert.Single(hierarchy.Initiatives.SelectMany(item => item.Epics), item => item.Id == portal.Id);
    }

    /// <summary>
    /// The brief a delivery lead actually writes: headings, prose, a nested list, a table, a task
    /// list, and a fenced code block. It exists to prove the description survives storage as a
    /// document rather than as the single line of text the initiative form used to save.
    /// </summary>
    private static readonly string MarkdownBrief = string.Join(
        "\n",
        "# Zero-friction sprint planning",
        "",
        "Planning a two-week sprint should take one focused conversation, not an",
        "afternoon of spreadsheet archaeology.",
        "",
        "## Success signals",
        "",
        "| Signal | Baseline | Target |",
        "| --- | --- | --- |",
        "| Time to commit a sprint | 46 min | under 10 min |",
        "",
        "## Guardrails",
        "",
        "- Keep the workspace usable on a phone",
        "  - Committing a sprint stays a desktop action",
        "- No new third-party services",
        "",
        "## Epics",
        "",
        "- [x] Groom the backlog into a ready queue",
        "- [ ] Roll sprint scope up to the initiative",
        "",
        "```sql",
        "SELECT i.Id, COUNT(s.Id) AS StoryCount",
        "FROM Initiatives i",
        "GROUP BY i.Id;",
        "```");

    [Fact]
    public async Task L2_046_Open_the_brief_for_an_initiative()
    {
        var created = await Given.AddInitiativeAsync("Zero-friction sprint planning", MarkdownBrief);

        var initiative = await Given.ReadInitiativeAsync(created.Id);

        Assert.Equal(created.Id, initiative.Id);
        Assert.Equal("Zero-friction sprint planning", initiative.Name);
        Assert.Equal(MarkdownBrief, initiative.Description);
    }

    [Fact]
    public async Task L2_046_Save_an_edited_brief()
    {
        var initiative = await Given.AddInitiativeAsync();
        var epic = await Given.AddEpicAsync(initiative.Id);
        await Given.AddDraftStoryAsync(epic.Id);

        var response = await Client.PutAsJsonAsync(
            $"/api/initiatives/{initiative.Id}",
            new InitiativeRequest("Zero-friction sprint planning", MarkdownBrief));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var saved = await Given.ReadInitiativeAsync(initiative.Id);
        Assert.Equal("Zero-friction sprint planning", saved.Name);
        Assert.Equal(MarkdownBrief, saved.Description);

        // The renamed initiative reaches every projection that names it.
        var story = Assert.Single(await Given.ReadBacklogAsync());
        Assert.Equal("Zero-friction sprint planning", story.InitiativeName);
    }

    [Fact]
    public async Task L2_046_Preserve_markdown_structure()
    {
        var initiative = await Given.AddInitiativeAsync("Zero-friction sprint planning", MarkdownBrief);

        // A second application over the same store, as a redeployment would be.
        using var restarted = Factory.Restart();
        using var client = restarted.CreateUnlockedClient();

        var reread = await new Workspace(client).ReadInitiativeAsync(initiative.Id);

        // Every structural line survives: no collapsing, escaping, or re-wrapping.
        Assert.Equal(MarkdownBrief.Split('\n'), reread.Description.Split('\n'));
        Assert.Equal(MarkdownBrief, reread.Description);
    }

    [Fact]
    public async Task L2_046_Reject_a_blank_brief()
    {
        var initiative = await Given.AddInitiativeAsync();

        var response = await Client.PutAsJsonAsync(
            $"/api/initiatives/{initiative.Id}",
            new InitiativeRequest("  ", "  \n  \n "));

        await ExpectInvalidFieldsAsync(response, "name", "description");
        Assert.Equal(
            "Make every engagement transparent and predictable.",
            (await Given.ReadInitiativeAsync(initiative.Id)).Description);
    }

    [Fact]
    public async Task L2_046_Reject_an_oversized_brief()
    {
        var initiative = await Given.AddInitiativeAsync();

        var response = await Client.PutAsJsonAsync(
            $"/api/initiatives/{initiative.Id}",
            new InitiativeRequest("Zero-friction sprint planning", new string('a', 100_001)));

        await ExpectInvalidFieldsAsync(response, "description");
        Assert.Equal(
            "Make every engagement transparent and predictable.",
            (await Given.ReadInitiativeAsync(initiative.Id)).Description);
    }
}
