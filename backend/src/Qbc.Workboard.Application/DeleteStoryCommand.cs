using MediatR;

namespace Qbc.Workboard.Application;

public sealed record DeleteStoryCommand(Guid Id) : IRequest;

