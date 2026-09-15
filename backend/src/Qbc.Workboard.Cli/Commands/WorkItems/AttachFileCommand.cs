using Microsoft.Extensions.Configuration;
using Qbc.Workboard.Application.Features.Attachments.Commands;
using Qbc.Workboard.Cli.Console;
using Qbc.Workboard.Cli.Services;
using Qbc.Workboard.Domain.Enums;
using System.CommandLine;

namespace Qbc.Workboard.Cli.Commands.WorkItems;

public sealed class AttachFileCommand
{
    /// <summary>
    /// The same names <c>UploadAttachmentCommand</c> refuses, kept here so a refusal is reported
    /// before a file is streamed. The API remains the authority; the list there is private.
    /// </summary>
    private static readonly string[] BlockedExtensions =
        ["exe", "bat", "cmd", "com", "msi", "scr", "sh", "ps1", "dll", "jar"];

    public AttachFileCommand(WorkboardApiClientFactory clientFactory, IConfiguration configuration, IConsoleWriter console)
    {
        var storyIdOption = new Option<Guid?>("--story-id") { Description = "Id of the story to attach the files to." };
        var storyKeyOption = new Option<string?>("--story-key") { Description = "Key of the story to attach the files to, e.g. QBC-106." };
        var fileOption = new Option<FileInfo[]>("--file")
        {
            Description = "Path of a file to attach. Repeat the option to attach several files. " +
                "Each file must be non-empty, at most 25 MB, and not a program or script.",
            Required = true
        };
        var uploadedByOption = new Option<string?>("--uploaded-by")
        {
            Description = "Full name of the assistant the attachment is attributed to. The assistant must already exist. " +
                "Leave unset to attach without an uploader."
        };
        var targetOption = ApiTargetOption.Create();
        var passcodeOption = PasscodeOption.Create();

        Command = new Command("attach-file", "Attach one or more local files to a story against the local or deployed Workboard API.");
        Command.Options.Add(storyIdOption);
        Command.Options.Add(storyKeyOption);
        Command.Options.Add(fileOption);
        Command.Options.Add(uploadedByOption);
        Command.Options.Add(targetOption);
        Command.Options.Add(passcodeOption);
        Command.SetAction(async (parseResult, cancellationToken) =>
        {
            var storyId = parseResult.GetValue(storyIdOption);
            var storyKey = parseResult.GetValue(storyKeyOption);
            if (storyId is null && string.IsNullOrWhiteSpace(storyKey))
            {
                console.WriteError("Provide --story-id or --story-key.");
                return 1;
            }

            var files = parseResult.GetValue(fileOption) ?? [];
            if (files.Length == 0)
            {
                console.WriteError("Provide at least one --file.");
                return 1;
            }

            foreach (var file in files)
            {
                var refusal = Refuse(file);
                if (refusal is not null)
                {
                    console.WriteError($"{file.Name}: {refusal}");
                    return 1;
                }
            }

            var passcode = PasscodeOption.Resolve(parseResult.GetValue(passcodeOption), configuration);
            if (string.IsNullOrWhiteSpace(passcode))
            {
                console.WriteError("No passcode provided. Pass --passcode or set the Api:Passcode configuration value.");
                return 1;
            }

            try
            {
                var client = clientFactory.Create(parseResult.GetValue(targetOption));
                await client.UnlockAsync(passcode, cancellationToken);

                var story = storyId is not null
                    ? await client.GetStoryAsync(storyId.Value, cancellationToken)
                    : await client.FindStoryByKeyAsync(storyKey!, cancellationToken);
                if (story is null)
                {
                    console.WriteError($"No story with key '{storyKey}' was found.");
                    return 1;
                }

                Guid? uploadedByAssistantId = null;
                var uploadedBy = parseResult.GetValue(uploadedByOption);
                if (!string.IsNullOrWhiteSpace(uploadedBy))
                {
                    var assistant = await client.FindAssistantByNameAsync(uploadedBy, cancellationToken);
                    if (assistant is null)
                    {
                        console.WriteError($"No assistant named '{uploadedBy}' was found.");
                        return 1;
                    }

                    uploadedByAssistantId = assistant.Id;
                }

                foreach (var file in files)
                {
                    await using var content = file.OpenRead();
                    var attachment = await client.UploadAttachmentAsync(
                        WorkItemKind.Story,
                        story.Id,
                        file.Name,
                        ContentTypeFor(file),
                        content,
                        uploadedByAssistantId,
                        cancellationToken);

                    console.WriteLine(
                        $"Attached '{attachment.FileName}' ({attachment.SizeInBytes} bytes, {attachment.Id}) to story '{story.Key}: {story.Title}'.");
                }

                return 0;
            }
            catch (Exception exception) when (exception is HttpRequestException or InvalidOperationException)
            {
                console.WriteError(exception.Message);
                return 1;
            }
        });
    }

    public Command Command { get; }

    /// <summary>
    /// Applies the workspace's own rules, in its order and words, so the reason arrives without a
    /// request. Returns <see langword="null"/> when the file may be sent.
    /// </summary>
    private static string? Refuse(FileInfo file)
    {
        if (Directory.Exists(file.FullName))
        {
            return "The file is empty, or is a folder. Folders have to be zipped first.";
        }

        if (!file.Exists)
        {
            return $"File '{file.FullName}' was not found.";
        }

        if (file.Length == 0)
        {
            return "The file is empty, or is a folder. Folders have to be zipped first.";
        }

        if (file.Length > UploadAttachmentCommand.MaximumBytes)
        {
            return "The file is over the 25 MB limit.";
        }

        if (BlockedExtensions.Contains(file.Extension.TrimStart('.').ToLowerInvariant()))
        {
            return "Programs and scripts cannot be attached.";
        }

        return null;
    }

    private static string ContentTypeFor(FileInfo file) => file.Extension.ToLowerInvariant() switch
    {
        ".pdf" => "application/pdf",
        ".png" => "image/png",
        ".jpg" or ".jpeg" => "image/jpeg",
        ".gif" => "image/gif",
        ".svg" => "image/svg+xml",
        ".txt" => "text/plain",
        ".md" => "text/markdown",
        ".csv" => "text/csv",
        ".json" => "application/json",
        ".xml" => "application/xml",
        ".zip" => "application/zip",
        ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        _ => "application/octet-stream"
    };
}
