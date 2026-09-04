namespace Qbc.Workboard.Application.Common.Deployment;

/// <summary>
/// Identifies the build the running process was produced from, so an operator can tell which
/// code a deployment is actually serving.
/// </summary>
public interface IDeploymentInformation
{
    /// <summary>The product version the build carries, such as <c>1.0.0</c>.</summary>
    string Version { get; }

    /// <summary>
    /// The source revision the build was produced from, or <see langword="null"/> when the build
    /// carries no revision. An unknown revision is reported as unknown, never inferred at runtime.
    /// </summary>
    string? Commit { get; }
}
