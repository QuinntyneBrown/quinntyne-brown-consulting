
namespace Qbc.Workboard.Application.Features.Assistants.Dtos;

public sealed record AssistantHoursDto(
    Guid AssistantId,
    string FullName,
    string Role,
    IReadOnlyList<string> Specialties,
    Availability Availability,
    decimal HoursLogged,
    decimal HoursOnCompletedStories,
    int StoriesWorkedOn,
    int CompletedStoriesWorkedOn,
    IReadOnlyList<AssistantHoursStoryDto> Stories);
