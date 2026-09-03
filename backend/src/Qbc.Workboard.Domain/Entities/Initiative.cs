namespace Qbc.Workboard.Domain.Entities;

public sealed class Initiative
{
    private Initiative()
    {
    }

    public Initiative(Guid id, string name, string description)
    {
        Id = id;
        Update(name, description);
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;

    public void Update(string name, string description)
    {
        Name = name.Trim();
        Description = description.Trim();
    }
}

