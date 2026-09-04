using System.Reflection;
using Qbc.Workboard.Application.Common.Deployment;

namespace Qbc.Workboard.Infrastructure.Deployment;

/// <summary>
/// Reads the build identity out of the deployed assembly, so the reported version is whatever
/// was actually compiled rather than a value the running process could be configured to claim.
/// Version and source revision are stamped as separate assembly metadata values so semantic
/// version build metadata cannot be mistaken for a commit.
/// </summary>
public sealed class AssemblyDeploymentInformation : IDeploymentInformation
{
    private const string VersionKey = "QbcBuildVersion";
    private const string RevisionKey = "QbcSourceRevision";

    public AssemblyDeploymentInformation(Assembly assembly)
    {
        var metadata = assembly
            .GetCustomAttributes<AssemblyMetadataAttribute>()
            .Where(attribute => attribute.Value is not null)
            .ToDictionary(attribute => attribute.Key, attribute => attribute.Value!, StringComparer.Ordinal);

        if (!metadata.TryGetValue(VersionKey, out var version) || string.IsNullOrWhiteSpace(version))
        {
            throw new InvalidOperationException($"The deployed assembly has no {VersionKey} metadata.");
        }

        Version = version;
        Commit = metadata.TryGetValue(RevisionKey, out var revision) && !string.IsNullOrWhiteSpace(revision)
            ? revision
            : null;
    }

    public string Version { get; }

    public string? Commit { get; }
}
