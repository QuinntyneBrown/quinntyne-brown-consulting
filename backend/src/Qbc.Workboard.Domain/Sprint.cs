namespace Qbc.Workboard.Domain;

public sealed class Sprint
{
    private Sprint()
    {
    }

    public Sprint(Guid id, string name, string goal, DateOnly startDate)
    {
        Id = id;
        Status = SprintStatus.Planned;
        Update(name, goal, startDate);
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Goal { get; private set; } = string.Empty;
    public DateOnly StartDate { get; private set; }
    public DateOnly EndDate { get; private set; }
    public SprintStatus Status { get; private set; }

    public void Update(string name, string goal, DateOnly startDate)
    {
        Name = name.Trim();
        Goal = goal.Trim();
        if (Status != SprintStatus.Completed)
        {
            StartDate = startDate;
            EndDate = startDate.AddDays(13);
        }
    }

    public void Start()
    {
        if (Status != SprintStatus.Planned)
        {
            throw new DomainRuleException("Only a planned sprint can be started.");
        }

        Status = SprintStatus.Active;
    }

    public void Complete()
    {
        if (Status != SprintStatus.Active)
        {
            throw new DomainRuleException("Only an active sprint can be completed.");
        }

        Status = SprintStatus.Completed;
    }
}

