using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Qbc.Workboard.Cli.IntegrationTests.Support;

/// <summary>
/// Stands in for the Workboard API behind the CLI's <c>HttpClient</c>: answers the routes a test
/// registers, records every request it receives, and answers 404 for anything else so a wrong
/// endpoint fails loudly.
/// </summary>
public sealed class FakeWorkboardApiHandler : HttpMessageHandler
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    private readonly Dictionary<(string Method, string PathAndQuery), (HttpStatusCode Status, string? Body)> _routes = [];
    private readonly List<CapturedRequest> _requests = [];

    public IReadOnlyList<CapturedRequest> Requests => _requests;

    /// <summary>
    /// Registers a canned answer. A <see cref="string"/> body is sent as-is (for Problem Details);
    /// any other object is serialized the way the API serializes it.
    /// </summary>
    public FakeWorkboardApiHandler When(HttpMethod method, string pathAndQuery, HttpStatusCode status, object? body = null)
    {
        var payload = body switch
        {
            null => null,
            string text => text,
            _ => JsonSerializer.Serialize(body, body.GetType(), Json)
        };
        _routes[(method.Method, pathAndQuery)] = (status, payload);
        return this;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var pathAndQuery = request.RequestUri?.PathAndQuery ?? string.Empty;
        var body = request.Content is null ? string.Empty : await request.Content.ReadAsStringAsync(cancellationToken);
        _requests.Add(new CapturedRequest(
            request.Method.Method,
            pathAndQuery,
            request.Headers.Authorization?.ToString(),
            request.Content?.Headers.ContentType?.ToString(),
            body));

        if (!_routes.TryGetValue((request.Method.Method, pathAndQuery), out var route))
        {
            return new HttpResponseMessage(HttpStatusCode.NotFound)
            {
                RequestMessage = request,
                Content = new StringContent($"No fake route for {request.Method} {pathAndQuery}.", Encoding.UTF8, "text/plain")
            };
        }

        var response = new HttpResponseMessage(route.Status) { RequestMessage = request };
        if (route.Body is not null)
        {
            response.Content = new StringContent(route.Body, Encoding.UTF8, "application/json");
        }

        return response;
    }
}
