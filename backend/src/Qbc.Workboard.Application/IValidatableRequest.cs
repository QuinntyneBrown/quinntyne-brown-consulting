namespace Qbc.Workboard.Application;

public interface IValidatableRequest
{
    IReadOnlyDictionary<string, string[]> Validate();
}

