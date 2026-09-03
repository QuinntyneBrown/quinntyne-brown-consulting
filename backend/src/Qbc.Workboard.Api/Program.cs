namespace Qbc.Workboard.Api;

using System.Text.Json;
using System.Text.Json.Serialization;
using Qbc.Workboard.Application;
using Qbc.Workboard.Infrastructure;

public sealed class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions
        {
            Args = args,
            ContentRootPath = AppContext.BaseDirectory
        });
        builder.Services.AddControllers().AddJsonOptions(options =>
        {
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        });
        builder.Services.AddOpenApi();
        builder.Services.AddProblemDetails();
        builder.Services.AddExceptionHandler<ProblemDetailsExceptionHandler>();
        builder.Services.AddApplication();
        builder.Services.AddInfrastructure(builder.Configuration);

        var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? [];
        if (origins.Length > 0)
        {
            builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod()));
        }

        var app = builder.Build();
        app.UseExceptionHandler();
        if (origins.Length > 0)
        {
            app.UseCors();
        }

        using (var scope = app.Services.CreateScope())
        {
            scope.ServiceProvider.GetRequiredService<WorkboardDbInitializer>().InitializeAsync().GetAwaiter().GetResult();
        }

        app.MapOpenApi();
        app.MapControllers();
        app.UseDefaultFiles();
        app.UseStaticFiles();
        if (app.Environment.WebRootFileProvider.GetFileInfo("index.html").Exists)
        {
            app.MapFallbackToFile("index.html");
        }
        app.Run();
    }
}
