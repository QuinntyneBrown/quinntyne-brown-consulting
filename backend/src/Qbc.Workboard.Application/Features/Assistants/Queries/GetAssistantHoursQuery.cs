using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Queries;

public sealed record GetAssistantHoursQuery(Guid Id) : IRequest<AssistantHoursDto>;
