namespace Qbc.Workboard.Application.Common.Security;

public interface IPasscodeHasher
{
    string Hash(string passcode);

    bool Verify(string passcode, string hash);
}
