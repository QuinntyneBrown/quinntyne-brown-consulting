using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Acceptance;

/// <summary>
/// Exhausting the unlock window is isolated in its own class so it gets its own host, and
/// therefore its own rate-limit partition, instead of starving the other suites. The whole
/// behaviour is one test because a shared window makes separate tests order-dependent.
/// </summary>
public sealed class WorkspaceAccessRateLimitAcceptanceTests : IClassFixture<WorkboardApiFactory>
{
    private readonly WorkboardApiFactory _factory;

    public WorkspaceAccessRateLimitAcceptanceTests(WorkboardApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Repeated_wrong_passcodes_are_throttled_with_problem_details()
    {
        var client = _factory.CreateClient();
        var first = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("1111"));
        Assert.Equal(HttpStatusCode.Unauthorized, first.StatusCode);

        HttpResponseMessage? throttled = null;
        for (var attempt = 0; attempt < 20 && throttled is null; attempt++)
        {
            var response = await client.PostAsJsonAsync("/api/access/unlock", new UnlockRequest("1111"));
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                throttled = response;
            }
        }

        Assert.NotNull(throttled);
        var body = await throttled.Content.ReadAsStringAsync();
        Assert.Contains("too-many-attempts", body, StringComparison.Ordinal);
    }
}
