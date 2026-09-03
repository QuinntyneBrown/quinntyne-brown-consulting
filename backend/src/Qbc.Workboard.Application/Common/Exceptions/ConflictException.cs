namespace Qbc.Workboard.Application.Common.Exceptions;

public sealed class ConflictException : Exception
{
    public ConflictException(string message, object? context = null) : base(message)
    {
        Context = context;
    }

    public object? Context { get; }
}

