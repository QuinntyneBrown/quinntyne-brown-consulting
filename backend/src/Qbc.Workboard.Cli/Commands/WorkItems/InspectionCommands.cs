using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using Qbc.Workboard.Domain.Enums;
using System.CommandLine;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class InspectionCommands
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }
    };

    public IReadOnlyList<Command> Commands { get; }

    public InspectionCommands(WorkboardApiClientFactory factory, IConfiguration configuration, IConsoleWriter console)
    {
        Commands = new[] { "login", "list-assistants", "list-stories", "get-story", "list-attachments", "download-attachment", "replace-attachment" }
            .Select(Create).ToArray();

        Command Create(string name)
        {
            var command = new Command(name, name == "replace-attachment"
                ? "Replace an attachment in place using its expected revision. Preserves identity, filename and original attribution."
                : "Inspect Workboard data or download an attachment through the authenticated API.");
            var target = ApiTargetOption.Create();
            var passcode = PasscodeOption.Create();
            var json = new Option<bool>("--json") { Description = "Write machine-readable JSON to stdout." };
            var assignee = new Option<Guid?>("--assignee-id");
            var unfinished = new Option<bool>("--unfinished") { Description = "Exclude archived and Done stories; include sprint work." };
            var storyId = new Option<Guid?>("--story-id");
            var storyKey = new Option<string?>("--story-key");
            var attachmentId = new Option<Guid>("--attachment-id") { Required = true };
            var output = new Option<string>("--output") { Required = true, Description = "New local output path; existing files are never overwritten." };
            var file = new Option<FileInfo>("--file") { Required = true };
            var revision = new Option<int>("--expected-revision") { Required = true };
            command.Options.Add(target);
            command.Options.Add(passcode);
            command.Options.Add(json);
            if (name == "list-stories") { command.Options.Add(assignee); command.Options.Add(unfinished); }
            if (name is not ("login" or "list-assistants" or "list-stories")) { command.Options.Add(storyId); command.Options.Add(storyKey); }
            if (name is "download-attachment" or "replace-attachment") command.Options.Add(attachmentId);
            if (name == "download-attachment") command.Options.Add(output);
            if (name == "replace-attachment") { command.Options.Add(file); command.Options.Add(revision); }

            command.SetAction(async (parse, cancellationToken) =>
            {
                try
                {
                    var inspectStory = name is not ("login" or "list-assistants" or "list-stories");
                    var id = inspectStory ? parse.GetValue(storyId) : null;
                    var key = inspectStory ? parse.GetValue(storyKey) : null;
                    if (inspectStory && (id.HasValue == !string.IsNullOrWhiteSpace(key)))
                        throw new InvalidOperationException("Provide exactly one of --story-id or --story-key.");
                    if (id == Guid.Empty) throw new InvalidOperationException("Story ID must not be empty.");
                    if (name == "replace-attachment")
                    {
                        var refusal = AttachFileCommand.Refuse(parse.GetValue(file)!);
                        if (refusal is not null) throw new InvalidOperationException(refusal);
                        if (parse.GetValue(revision) < 0) throw new InvalidOperationException("Expected revision must be non-negative.");
                    }
                    var secret = PasscodeOption.Resolve(parse.GetValue(passcode), configuration);
                    var client = factory.Create(parse.GetValue(target));
                    if (name == "login")
                    {
                        if (!parse.GetValue(json)) throw new InvalidOperationException("Login requires --json; capture its token and keep it private.");
                        if (string.IsNullOrWhiteSpace(secret)) throw new InvalidOperationException("Set Api__Passcode or provide --passcode.");
                        console.WriteLine(JsonSerializer.Serialize(await client.UnlockAsync(secret, cancellationToken), Json));
                        return 0;
                    }
                    var accessToken = configuration["Api:AccessToken"];
                    if (!string.IsNullOrWhiteSpace(accessToken)) client.UseAccessToken(accessToken);
                    else
                    {
                        if (string.IsNullOrWhiteSpace(secret)) throw new InvalidOperationException("Set Api__AccessToken, Api__Passcode or provide --passcode.");
                        await client.UnlockAsync(secret, cancellationToken);
                    }

                    if (name == "list-assistants")
                    {
                        var items = await client.ListAssistantsAsync(cancellationToken);
                        Write(items, string.Join(Environment.NewLine, items.Select(item => $"{item.Id}  {item.FullName}")));
                        return 0;
                    }
                    if (name == "list-stories")
                    {
                        var owner = parse.GetValue(assignee);
                        if (owner is not null && !(await client.ListAssistantsAsync(cancellationToken)).Any(item => item.Id == owner))
                            throw new InvalidOperationException($"No assistant with ID '{owner}' was found.");
                        var stories = (await client.ListStoriesAsync(cancellationToken))
                            .Where(item => owner is null || item.AssistantId == owner)
                            .Where(item => !parse.GetValue(unfinished) || (item.Lifecycle != StoryLifecycle.Archived && item.BoardStatus != BoardStatus.Done)).ToArray();
                        Write(stories, string.Join(Environment.NewLine, stories.Select(item => $"{item.Key}  {item.Title}  {item.AssistantName}  {item.Lifecycle}/{item.BoardStatus}  {item.Priority}")));
                        return 0;
                    }

                    var story = id is not null ? await client.GetStoryAsync(id.Value, cancellationToken)
                        : (await client.ListStoriesAsync(cancellationToken)).SingleOrDefault(item => string.Equals(item.Key, key, StringComparison.OrdinalIgnoreCase))
                            ?? throw new InvalidOperationException($"No story with key '{key}' was found.");
                    if (name == "get-story") { Write(story, $"{story.Key}: {story.Title}\n{story.Description}\n{story.AcceptanceCriteria}"); return 0; }
                    var attachments = await client.ListAttachmentsAsync(story.Id, cancellationToken);
                    if (name == "list-attachments")
                    {
                        Write(attachments, string.Join(Environment.NewLine, attachments.Select(item => $"{item.Id}  {item.FileName}  {item.SizeInBytes} bytes  revision {item.Revision}")));
                        return 0;
                    }
                    var attachment = attachments.SingleOrDefault(item => item.Id == parse.GetValue(attachmentId)
                        && item.WorkItemKind == WorkItemKind.Story && item.WorkItemId == story.Id)
                        ?? throw new InvalidOperationException("The attachment does not belong to the specified story.");
                    if (name == "download-attachment")
                    {
                        var path = Path.GetFullPath(parse.GetValue(output)!);
                        await client.DownloadAttachmentAsync(attachment.Id, path, cancellationToken);
                        Write(new { attachment.Id, attachment.Revision, output = path }, $"Downloaded {attachment.FileName} to {path}");
                        return 0;
                    }
                    var replacement = parse.GetValue(file)!;
                    if (!string.Equals(replacement.Extension, Path.GetExtension(attachment.FileName), StringComparison.OrdinalIgnoreCase))
                        throw new InvalidOperationException("Replacement must use the original file extension.");
                    if (attachment.Revision != parse.GetValue(revision))
                        throw new InvalidOperationException("The attachment revision changed. Download and review it before retrying.");
                    var result = await client.ReplaceAttachmentAsync(attachment.Id, replacement, AttachFileCommand.ContentTypeFor(replacement), parse.GetValue(revision), cancellationToken);
                    Write(result, $"Replaced {result.FileName} ({result.Id}), revision {result.Revision}.");
                    return 0;

                    void Write<T>(T value, string human) => console.WriteLine(parse.GetValue(json) ? JsonSerializer.Serialize(value, Json) : human);
                }
                catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException or IOException or UnauthorizedAccessException or JsonException or OperationCanceledException)
                {
                    console.WriteError(exception is OperationCanceledException ? "The request was cancelled or timed out; verify current state before retrying." : exception.Message);
                    return 1;
                }
            });
            return command;
        }
    }
}
