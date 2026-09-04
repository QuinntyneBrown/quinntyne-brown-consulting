namespace Qbc.Workboard.Domain.Entities;

public sealed class TimeEntry
{
    private TimeEntry()
    {
    }

    public TimeEntry(Guid id, Guid storyId, Guid assistantId, DateOnly workedOn, decimal hours, string note)
    {
        Id = id;
        StoryId = storyId;
        Update(assistantId, workedOn, hours, note);
    }

    public Guid Id { get; private set; }
    public Guid StoryId { get; private set; }
    public Guid AssistantId { get; private set; }
    public DateOnly WorkedOn { get; private set; }
    public decimal Hours { get; private set; }
    public string Note { get; private set; } = string.Empty;

    public void Update(Guid assistantId, DateOnly workedOn, decimal hours, string note)
    {
        AssistantId = assistantId;
        WorkedOn = workedOn;
        Hours = hours;
        Note = note.Trim();
    }
}
