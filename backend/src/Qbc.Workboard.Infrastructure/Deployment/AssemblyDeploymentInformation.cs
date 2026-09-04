using System.Reflection;
using Qbc.Workboard.Application.Common.Deployment;

namespace Qbc.Workboard.Infrastructure.Deployment;

/// <summary>
/// Reads the build identity out of the deployed assembly, so the reported version is whatever
/// was actually compiled rather than a value the running process could be configured to claim.
/// The .NET SDK writes <c>AssemblyInformationalVersion</c> as
/// <c>&lt;version&gt;+&lt;source revision&gt;</c> whenever a <c>SourceRevisionId</c> is available:
/// the deployment pipeline supplies the commit it is building, and an ordinary build picks up
/// the checkout's own <c>HEAD</c>. A build with neither reports no commit rather than an
/// invented one.
/// </summary>
public sealed class AssemblyDeploymentInformation : IDeploymentInformation
{
    public AssemblyDeploymentInformation(Assembly assembly)
    {
        var stamped =
            assembly.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion
            ?? assembly.GetName().Version?.ToString()
            ?? "0.0.0";
        var separator = stamped.IndexOf('+');
        Version = separator < 0 ? stamped : stamped[..separator];
        var commit = separator < 0 ? string.Empty : stamped[(separator + 1)..];
        Commit = string.IsNullOrWhiteSpace(commit) ? null : commit;
    }

    public string Version { get; }

    public string? Commit { get; }
}
