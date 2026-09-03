using MediatR;

namespace Qbc.Workboard.Application;

public sealed record DeleteEpicCommand(Guid Id) : IRequest;

