using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Qbc.Workboard.Application.Common.Security;
using Qbc.Workboard.Infrastructure.Security;

namespace Qbc.Workboard.Infrastructure.Persistence;

public sealed class WorkboardDbInitializer
{
    private const int WorkspaceAccessId = 1;
    private const int SigningKeySize = 32;

    private readonly WorkboardDbContext _db;
    private readonly IWorkboardSchemaInitializer _schema;
    private readonly WorkboardDatabaseOptions _options;
    private readonly WorkspaceAccessOptions _accessOptions;
    private readonly IPasscodeHasher _passcodeHasher;
    private readonly TimeProvider _timeProvider;

    public WorkboardDbInitializer(
        WorkboardDbContext db,
        IWorkboardSchemaInitializer schema,
        IOptions<WorkboardDatabaseOptions> options,
        IOptions<WorkspaceAccessOptions> accessOptions,
        IPasscodeHasher passcodeHasher,
        TimeProvider timeProvider)
    {
        _db = db;
        _schema = schema;
        _options = options.Value;
        _accessOptions = accessOptions.Value;
        _passcodeHasher = passcodeHasher;
        _timeProvider = timeProvider;
    }

    public Task InitializeAsync(CancellationToken cancellationToken = default) =>
        InitializeAsync(_options.SeedDevelopmentData, cancellationToken);

    public async Task InitializeAsync(bool seedDevelopmentData, CancellationToken cancellationToken = default)
    {
        await _schema.EnsureSchemaAsync(cancellationToken);
        await EnsureWorkspaceAccessAsync(cancellationToken);
        if (!seedDevelopmentData || await _db.Set<Initiative>().AnyAsync(cancellationToken))
        {
            return;
        }

        Seed();
        await _db.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Creates the single workspace access row when it is absent. This runs on every
    /// initialize and reset, independently of the development-data seed, so the workspace
    /// always has a passcode and a signing key.
    /// </summary>
    private async Task EnsureWorkspaceAccessAsync(CancellationToken cancellationToken)
    {
        if (await _db.Set<WorkspaceAccess>().AnyAsync(cancellationToken))
        {
            return;
        }

        _db.Add(new WorkspaceAccess(
            WorkspaceAccessId,
            _passcodeHasher.Hash(_accessOptions.InitialPasscode),
            Convert.ToBase64String(RandomNumberGenerator.GetBytes(SigningKeySize)),
            _timeProvider.GetUtcNow()));

        await _db.SaveChangesAsync(cancellationToken);
    }

    private void Seed()
    {
        var mayaId = Guid.Parse("10000000-0000-0000-0000-000000000001");
        var noahId = Guid.Parse("10000000-0000-0000-0000-000000000002");
        var amaraId = Guid.Parse("10000000-0000-0000-0000-000000000003");
        var clientId = Guid.Parse("20000000-0000-0000-0000-000000000001");
        var aiId = Guid.Parse("20000000-0000-0000-0000-000000000002");
        var portalId = Guid.Parse("30000000-0000-0000-0000-000000000001");
        var playbookId = Guid.Parse("30000000-0000-0000-0000-000000000002");
        var copilotId = Guid.Parse("30000000-0000-0000-0000-000000000003");
        var sprint14Id = Guid.Parse("40000000-0000-0000-0000-000000000014");
        var sprint15Id = Guid.Parse("40000000-0000-0000-0000-000000000015");
        var sprint13Id = Guid.Parse("40000000-0000-0000-0000-000000000013");

        _db.Add(new Assistant(mayaId, "Maya Chen", "Product & Research Assistant", ["Discovery", "User research", "Product ops"], Availability.Available));
        _db.Add(new Assistant(noahId, "Noah Williams", "Software Development Assistant", ["Full-stack", "Quality", "APIs"], Availability.Available));
        _db.Add(new Assistant(amaraId, "Amara Okafor", "AI Delivery Assistant", ["AI workflows", "Evaluation", "Data"], Availability.Limited));
        _db.Add(new Initiative(clientId, "Client Delivery Excellence", "Make every consulting engagement clear, predictable, and valuable."));
        _db.Add(new Initiative(aiId, "AI-Enabled Consulting", "Build practical AI capabilities that improve how clients work."));
        _db.Add(new Epic(portalId, clientId, "Client project portal", "A calm, shared view of delivery progress and decisions."));
        _db.Add(new Epic(playbookId, clientId, "Delivery playbook", "Reusable practices for faster project starts."));
        _db.Add(new Epic(copilotId, aiId, "Consulting copilot", "Responsible AI assistance for research and delivery."));

        var sprint13 = new Sprint(sprint13Id, "Sprint 13", "Standardize the first week of a new engagement.", new DateOnly(2026, 8, 17));
        sprint13.Start();
        sprint13.Complete();
        var sprint14 = new Sprint(sprint14Id, "Sprint 14", "Give clients a clearer view of delivery and decisions.", new DateOnly(2026, 8, 31));
        sprint14.Start();
        _db.Add(sprint13);
        _db.Add(sprint14);
        _db.Add(new Sprint(sprint15Id, "Sprint 15", "Make responsible AI engagement planning repeatable.", new DateOnly(2026, 9, 14)));

        AddStory(101, portalId, "See a concise project health summary", "As a client, I want a quick project health summary so that I know where attention is needed.", "Shows delivery status, risks, next milestone, and last updated time.", 5, noahId, sprint14Id, BoardStatus.InProgress,
            [("Build summary card", true, noahId), ("Review health language", false, mayaId)]);
        AddStory(102, portalId, "Capture a client decision", "As a consultant, I want to record a client decision with context so that the team can act consistently.", "A decision includes owner, date, context, and outcome.", 3, mayaId, sprint14Id, BoardStatus.ToDo,
            [("Draft decision form", false, mayaId)]);
        AddStory(103, copilotId, "Evaluate answers against source material", "As an AI delivery lead, I want grounded-answer evaluation so that client recommendations remain trustworthy.", "Evaluation reports citation coverage and unsupported claims for a test set.", 8, amaraId, sprint14Id, BoardStatus.ToDo, []);
        AddStory(104, playbookId, "Start a project from a lightweight checklist", "As a delivery lead, I want a repeatable kickoff checklist so that setup work is not missed.", "Checklist covers access, stakeholders, goals, risks, and communication cadence.", 3, null, sprint14Id, BoardStatus.Done,
            [("Validate with recent projects", true, mayaId)]);
        AddStory(105, copilotId, "Create an AI engagement risk canvas", "As a consultant, I want to identify AI delivery risks early so that mitigations are part of the plan.", "Canvas covers privacy, quality, adoption, security, and human oversight.", 5, amaraId, null, BoardStatus.ToDo, []);

        var draft = new Story(Guid.NewGuid(), 106, portalId, "Share milestone notes with clients");
        draft.Update(portalId, draft.Title, "As a client, I want milestone notes in one place so that I can review decisions and outcomes.", string.Empty, null, null);
        _db.Add(draft);
        var archived = new Story(Guid.NewGuid(), 97, playbookId, "Compare kickoff template formats");
        archived.Update(playbookId, archived.Title, "An older exploration retained for reference.", "Research is summarized.", 2, null);
        archived.Archive();
        _db.Add(archived);
        _db.Add(new StoryKeySequence(1, 107));
    }

    private void AddStory(
        long number,
        Guid epicId,
        string title,
        string description,
        string criteria,
        int points,
        Guid? assistantId,
        Guid? sprintId,
        BoardStatus status,
        IReadOnlyList<(string Title, bool Complete, Guid? AssistantId)> tasks)
    {
        var story = new Story(Guid.NewGuid(), number, epicId, title);
        story.Update(epicId, title, description, criteria, points, assistantId);
        story.MarkReady();
        if (sprintId is not null)
        {
            story.AssignToSprint(sprintId.Value);
            story.MoveTo(status);
        }

        story.ReplaceTasks(tasks.Select(task => new StoryTask(Guid.NewGuid(), story.Id, task.Title, task.Complete, task.AssistantId)));
        _db.Add(story);
    }
}
