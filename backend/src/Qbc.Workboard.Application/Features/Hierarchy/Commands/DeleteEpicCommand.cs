using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Commands;

public sealed record DeleteEpicCommand(Guid Id) : IRequest;

