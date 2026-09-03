using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetAssistantsQuery : IRequest<IReadOnlyList<AssistantDto>>;

