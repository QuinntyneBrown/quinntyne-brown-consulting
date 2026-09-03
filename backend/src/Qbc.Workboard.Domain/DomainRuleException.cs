namespace Qbc.Workboard.Domain;

public sealed class DomainRuleException : Exception
{
    public DomainRuleException(string message) : base(message)
    {
    }
}

