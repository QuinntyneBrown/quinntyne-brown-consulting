namespace Qbc.Workboard.Domain.Entities;

public sealed class WorkspaceAccess
{
    private WorkspaceAccess()
    {
    }

    public WorkspaceAccess(int id, string passcodeHash, string signingKey, DateTimeOffset updatedAtUtc)
    {
        Id = id;
        SigningKey = signingKey.Trim();
        SetPasscode(passcodeHash, updatedAtUtc);
    }

    public int Id { get; private set; }
    public string PasscodeHash { get; private set; } = string.Empty;
    public string SigningKey { get; private set; } = string.Empty;
    public DateTimeOffset UpdatedAtUtc { get; private set; }

    public void SetPasscode(string passcodeHash, DateTimeOffset updatedAtUtc)
    {
        if (string.IsNullOrWhiteSpace(passcodeHash))
        {
            throw new DomainRuleException("A workspace passcode hash is required.");
        }

        PasscodeHash = passcodeHash.Trim();
        UpdatedAtUtc = updatedAtUtc;
    }
}
