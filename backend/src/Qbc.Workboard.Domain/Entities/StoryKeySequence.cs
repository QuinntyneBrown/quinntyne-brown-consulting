namespace Qbc.Workboard.Domain.Entities;

public sealed class StoryKeySequence
{
    private StoryKeySequence()
    {
    }

    public StoryKeySequence(int id, long nextNumber)
    {
        Id = id;
        NextNumber = nextNumber;
    }

    public int Id { get; private set; }
    public long NextNumber { get; private set; }

    public long TakeNext()
    {
        var value = NextNumber;
        NextNumber++;
        return value;
    }
}
