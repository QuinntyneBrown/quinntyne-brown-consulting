using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetAssistantQuery(Guid Id) : IRequest<AssistantDto>;

