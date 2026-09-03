using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Commands;

public sealed record DeleteAssistantCommand(Guid Id) : IRequest;

