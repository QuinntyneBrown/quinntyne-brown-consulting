using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Application;

public sealed record AssistantDto(
    Guid Id,
    string FullName,
    string Role,
    IReadOnlyList<string> Specialties,
    Availability Availability,
    int StoryCount,
    int IncompleteTaskCount,
    IReadOnlyList<AssignmentLinkDto> BlockingAssignments);

