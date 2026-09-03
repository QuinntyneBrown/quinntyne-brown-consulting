using MediatR;

namespace Qbc.Workboard.Application;

public sealed record GetWorkspaceQuery(string Route) : IRequest<WorkspaceBootstrapDto>;

