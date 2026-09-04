namespace Qbc.Workboard.Domain.Entities;

public sealed class TimeEntry
{
    private TimeEntry()
    {
    }

    public TimeEntry(Guid id, Guid storyId, Guid assistantId, DateOnly workedOn, decimal hours, string note)
    {
        Id = id;
        Update(storyId, assistantId, workedOn, hours, note);
    }

    public Guid Id { get; private set; }
    public Guid StoryId { get; private set; }
    public Guid AssistantId { get; private set; }
    public DateOnly WorkedOn { get; private set; }
    public decimal Hours { get; private set; }
    public string Note { get; private set; } = string.Empty;

    /// <summary>
    /// Restates the whole entry, the story it names included: an amendment corrects what the time
    /// was spent on as readily as how much of it there was.
    /// </summary>
    public void Update(Guid storyId, Guid assistantId, DateOnly workedOn, decimal hours, string note)
    {
        StoryId = storyId;
        AssistantId = assistantId;
        WorkedOn = workedOn;
        Hours = hours;
        Note = note.Trim();
    }
}
