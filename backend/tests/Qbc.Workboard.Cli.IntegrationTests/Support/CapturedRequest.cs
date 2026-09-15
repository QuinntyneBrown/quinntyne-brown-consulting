namespace Qbc.Workboard.Cli.IntegrationTests.Support;

/// <summary>One request the fake API received, with its body read before the client disposed it.</summary>
public sealed record CapturedRequest(string Method, string PathAndQuery, string? Authorization, string? ContentType, string Body);
