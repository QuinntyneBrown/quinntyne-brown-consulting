namespace Qbc.Workboard.Domain.Entities;

public sealed class Epic
{
    private Epic()
    {
    }

    public Epic(Guid id, Guid initiativeId, string name, string summary)
    {
        Id = id;
        Update(initiativeId, name, summary);
    }

    public Guid Id { get; private set; }
    public Guid InitiativeId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Summary { get; private set; } = string.Empty;

    public void Update(Guid initiativeId, string name, string summary)
    {
        InitiativeId = initiativeId;
        Name = name.Trim();
        Summary = summary.Trim();
    }
}

