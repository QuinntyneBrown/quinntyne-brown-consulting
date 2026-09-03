using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed record GetAssistantQuery(Guid Id) : IRequest<AssistantDto>;

