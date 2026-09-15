using Microsoft.Extensions.Hosting;
using Qbc.Workboard.Application.Features.Access.Dtos;
using Qbc.Workboard.Cli.Services;
using System.Net;

namespace Qbc.Workboard.Cli.IntegrationTests.Support;

/// <summary>
/// Runs the real CLI host for the <c>workitem</c> commands over a fake API. The workspace is
/// already unlockable with the configured passcode, no database is touched, and the files a test
/// attaches live in a temporary directory removed on dispose.
/// </summary>
public sealed class WorkboardApiCliTestHost : IDisposable
{
    public const string Passcode = "2846";

    private readonly IHost _host;
    private readonly DirectoryInfo _files;

    private WorkboardApiCliTestHost(IHost host, TestConsoleWriter console, FakeWorkboardApiHandler api, DirectoryInfo files)
    {
        _host = host;
        Console = console;
        Api = api;
        _files = files;
    }

    public TestConsoleWriter Console { get; }

    public FakeWorkboardApiHandler Api { get; }

    public static WorkboardApiCliTestHost Create()
    {
        var console = new TestConsoleWriter();
        var api = new FakeWorkboardApiHandler()
            .When(HttpMethod.Post, "/api/access/unlock", HttpStatusCode.OK, new AccessTokenDto("test-token", DateTimeOffset.UtcNow.AddDays(7)));
        var host = new CliHostBuilder().Build(builder =>
        {
            builder.Configuration["Api:Local"] = "https://workboard.test";
            builder.Configuration["Api:Passcode"] = Passcode;
            builder.Services.AddSingleton<IConsoleWriter>(console);
            builder.Services.AddHttpClient(nameof(WorkboardApiClient)).ConfigurePrimaryHttpMessageHandler(() => api);
        });
        return new WorkboardApiCliTestHost(host, console, api, Directory.CreateTempSubdirectory("qbc-cli-"));
    }

    public Task<int> InvokeAsync(params string[] arguments) =>
        _host.Services.GetRequiredService<CliApplication>().InvokeAsync(arguments);

    public string WriteFile(string name, byte[] content)
    {
        var path = Path.Combine(_files.FullName, name);
        File.WriteAllBytes(path, content);
        return path;
    }

    public void Dispose()
    {
        _host.Dispose();
        try
        {
            _files.Delete(recursive: true);
        }
        catch (IOException)
        {
            // A file still open by a failed test is not worth failing the run over.
        }
    }
}
