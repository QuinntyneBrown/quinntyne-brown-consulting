using MediatR;

namespace Qbc.Workboard.Application.Features.TimeEntries.Commands;

public sealed record DeleteTimeEntryCommand(Guid Id) : IRequest;
