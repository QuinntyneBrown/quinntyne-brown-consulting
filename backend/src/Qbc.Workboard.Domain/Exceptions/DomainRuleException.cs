namespace Qbc.Workboard.Domain.Exceptions;

public sealed class DomainRuleException : Exception
{
    public DomainRuleException(string message) : base(message)
    {
    }
}

