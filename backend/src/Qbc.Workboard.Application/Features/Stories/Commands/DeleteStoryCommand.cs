using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed record DeleteStoryCommand(Guid Id) : IRequest;

