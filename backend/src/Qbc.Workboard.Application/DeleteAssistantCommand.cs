using MediatR;

namespace Qbc.Workboard.Application;

public sealed record DeleteAssistantCommand(Guid Id) : IRequest;

