using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Support;

/// <summary>
/// Gives every test its own application and its own empty workspace. xUnit builds a new test-class
/// instance per test, so nothing a test writes can reach another one, and each scenario can assert
/// against records it created itself — including the story keys, which start at QBC-101 every time.
/// </summary>
public abstract class AcceptanceTest : IDisposable
{
    private const string ProblemPrefix = "urn:qbc-workboard:problem:";

    protected AcceptanceTest()
    {
        Factory = new WorkboardApiFactory();
        Client = Factory.CreateUnlockedClient();
        Given = new Workspace(Client);
    }

    protected WorkboardApiFactory Factory { get; }

    /// <summary>The workspace client, already through the passcode gate.</summary>
    protected HttpClient Client { get; }

    /// <summary>Builds the records a scenario's Given clause assumes.</summary>
    protected Workspace Given { get; }

    /// <summary>
    /// Asserts the response is the machine-readable failure the API promises, and hands back the
    /// body so a test can go on to check the field errors or the blocking work it carries.
    /// </summary>
    protected static async Task<JsonElement> ExpectProblemAsync(
        HttpResponseMessage response,
        HttpStatusCode status,
        string problem)
    {
        Assert.Equal(status, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal($"{ProblemPrefix}{problem}", body.GetProperty("type").GetString());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("detail").GetString()));
        return body;
    }

    /// <summary>Asserts the response names each of these fields as invalid.</summary>
    protected static async Task ExpectInvalidFieldsAsync(
        HttpResponseMessage response,
        params string[] fields)
    {
        var problem = await ExpectProblemAsync(response, HttpStatusCode.BadRequest, "validation");
        var errors = problem.GetProperty("errors");
        foreach (var field in fields)
        {
            Assert.True(errors.TryGetProperty(field, out var messages), $"{field} was not reported as invalid.");
            Assert.NotEmpty(messages.EnumerateArray());
        }
    }

    public void Dispose()
    {
        Client.Dispose();
        Factory.Dispose();
        GC.SuppressFinalize(this);
    }
}
