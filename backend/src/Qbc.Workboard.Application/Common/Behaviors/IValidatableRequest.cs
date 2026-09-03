namespace Qbc.Workboard.Application.Common.Behaviors;

public interface IValidatableRequest
{
    IReadOnlyDictionary<string, string[]> Validate();
}

