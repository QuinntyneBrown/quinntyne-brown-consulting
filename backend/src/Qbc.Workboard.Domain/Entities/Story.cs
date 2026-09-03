namespace Qbc.Workboard.Domain.Entities;

public sealed class Story
{
    private readonly List<StoryTask> _tasks = [];

    private Story()
    {
    }

    public Story(Guid id, long number, Guid epicId, string title)
    {
        Id = id;
        Number = number;
        EpicId = epicId;
        Title = title.Trim();
        Lifecycle = StoryLifecycle.Draft;
        BoardStatus = BoardStatus.ToDo;
    }

    public Guid Id { get; private set; }
    public long Number { get; private set; }
    public string Key => $"QBC-{Number}";
    public Guid EpicId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string AcceptanceCriteria { get; private set; } = string.Empty;
    public int? Points { get; private set; }
    public Guid? AssistantId { get; private set; }
    public StoryLifecycle Lifecycle { get; private set; }
    public bool IsReady { get; private set; }
    public Guid? SprintId { get; private set; }
    public BoardStatus BoardStatus { get; private set; }
    public IReadOnlyCollection<StoryTask> Tasks => _tasks.AsReadOnly();

    public void Update(Guid epicId, string title, string description, string acceptanceCriteria, int? points, Guid? assistantId)
    {
        EpicId = epicId;
        Title = title.Trim();
        Description = description.Trim();
        AcceptanceCriteria = acceptanceCriteria.Trim();
        Points = points;
        AssistantId = assistantId;
    }

    public void ReplaceTasks(IEnumerable<StoryTask> tasks)
    {
        _tasks.Clear();
        _tasks.AddRange(tasks);
    }

    public void MarkReady()
    {
        if (Lifecycle == StoryLifecycle.Archived)
        {
            throw new DomainRuleException("An archived story cannot be groomed.");
        }

        Lifecycle = StoryLifecycle.Active;
        IsReady = true;
    }

    public void MarkUnready()
    {
        if (SprintId is not null)
        {
            throw new DomainRuleException("Remove the story from its sprint before marking it unready.");
        }

        IsReady = false;
    }

    public void Archive()
    {
        Lifecycle = StoryLifecycle.Archived;
        IsReady = false;
        SprintId = null;
        BoardStatus = BoardStatus.ToDo;
    }

    public void RestoreAsDraft()
    {
        if (Lifecycle != StoryLifecycle.Archived)
        {
            throw new DomainRuleException("Only an archived story can be restored.");
        }

        Lifecycle = StoryLifecycle.Draft;
        IsReady = false;
        SprintId = null;
        BoardStatus = BoardStatus.ToDo;
    }

    public void AssignToSprint(Guid sprintId)
    {
        if (Lifecycle != StoryLifecycle.Active || !IsReady)
        {
            throw new DomainRuleException("Only an active, Ready story can be assigned to a sprint.");
        }

        SprintId = sprintId;
        BoardStatus = BoardStatus.ToDo;
    }

    public void ReturnToBacklog()
    {
        SprintId = null;
        BoardStatus = BoardStatus.ToDo;
    }

    public void MoveTo(BoardStatus status)
    {
        BoardStatus = status;
    }
}

