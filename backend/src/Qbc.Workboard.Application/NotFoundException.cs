namespace Qbc.Workboard.Application;

public sealed class NotFoundException : Exception
{
    public NotFoundException(string resource, object id)
        : base($"{resource} '{id}' was not found.")
    {
    }
}

