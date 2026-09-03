using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed record GetAssistantsQuery : IRequest<IReadOnlyList<AssistantDto>>;

