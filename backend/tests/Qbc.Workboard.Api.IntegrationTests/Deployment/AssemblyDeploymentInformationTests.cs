using System.Reflection;
using System.Reflection.Emit;
using Qbc.Workboard.Infrastructure.Deployment;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Deployment;

public sealed class AssemblyDeploymentInformationTests
{
    [Fact]
    public void L2_044_Name_the_commit_a_released_build_came_from()
    {
        var assembly = AssemblyBuilder.DefineDynamicAssembly(
            new AssemblyName($"VersionTest-{Guid.NewGuid():N}"),
            AssemblyBuilderAccess.Run);
        var constructor = typeof(AssemblyMetadataAttribute).GetConstructor([typeof(string), typeof(string)]);
        Assert.NotNull(constructor);
        assembly.SetCustomAttribute(new CustomAttributeBuilder(
            constructor,
            ["QbcBuildVersion", "2.3.4+portable"]));

        var deployment = new AssemblyDeploymentInformation(assembly);

        Assert.Equal("2.3.4+portable", deployment.Version);
        Assert.Null(deployment.Commit);
    }
}
