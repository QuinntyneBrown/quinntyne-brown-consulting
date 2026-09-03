using MediatR;

namespace Qbc.Workboard.Application.Features.Access.Commands;

public sealed record UnlockWorkspaceCommand(string Passcode) : IRequest<AccessTokenDto>, IValidatableRequest
{
    public IReadOnlyDictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Passcode) || Passcode.Length != 4 || !Passcode.All(char.IsAsciiDigit))
        {
            errors["passcode"] = ["The passcode is four digits."];
        }

        return errors;
    }
}
