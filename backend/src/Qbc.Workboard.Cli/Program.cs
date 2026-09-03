using Microsoft.Extensions.DependencyInjection;

namespace Qbc.Workboard.Cli;

public static class Program
{
    public static async Task<int> Main(string[] args)
    {
        using var host = new CliHostBuilder().Build();
        return await host.Services.GetRequiredService<CliApplication>().InvokeAsync(args);
    }
}
