namespace Qbc.Workboard.Domain;

public sealed class StoryTask
{
    private StoryTask()
    {
    }

    public StoryTask(Guid id, Guid storyId, string title, bool isComplete, Guid? assistantId)
    {
        Id = id;
        StoryId = storyId;
        Update(title, isComplete, assistantId);
    }

    public Guid Id { get; private set; }
    public Guid StoryId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public bool IsComplete { get; private set; }
    public Guid? AssistantId { get; private set; }

    public void Update(string title, bool isComplete, Guid? assistantId)
    {
        Title = title.Trim();
        IsComplete = isComplete;
        AssistantId = assistantId;
    }
}

