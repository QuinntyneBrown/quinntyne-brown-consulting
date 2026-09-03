using System.Security.Cryptography;
using Qbc.Workboard.Application.Common.Security;

namespace Qbc.Workboard.Infrastructure.Security;

/// <summary>
/// Hashes the shared workspace passcode with PBKDF2. A four-digit passcode has only ten
/// thousand combinations, so the iteration count is a deliberate brake on guessing rather
/// than a substitute for the rate limit on the unlock endpoint.
/// </summary>
public sealed class Pbkdf2PasscodeHasher : IPasscodeHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 32;
    private const int Iterations = 210_000;
    private static readonly HashAlgorithmName Algorithm = HashAlgorithmName.SHA256;

    public string Hash(string passcode)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var key = Rfc2898DeriveBytes.Pbkdf2(passcode, salt, Iterations, Algorithm, KeySize);
        return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(key)}";
    }

    public bool Verify(string passcode, string hash)
    {
        var parts = hash.Split('.');
        if (parts.Length != 3
            || !int.TryParse(parts[0], out var iterations)
            || !TryDecode(parts[1], out var salt)
            || !TryDecode(parts[2], out var expected))
        {
            return false;
        }

        var actual = Rfc2898DeriveBytes.Pbkdf2(passcode, salt, iterations, Algorithm, expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static bool TryDecode(string value, out byte[] bytes)
    {
        var buffer = new byte[((value.Length * 3) + 3) / 4];
        if (Convert.TryFromBase64String(value, buffer, out var written))
        {
            bytes = buffer[..written];
            return true;
        }

        bytes = [];
        return false;
    }
}
