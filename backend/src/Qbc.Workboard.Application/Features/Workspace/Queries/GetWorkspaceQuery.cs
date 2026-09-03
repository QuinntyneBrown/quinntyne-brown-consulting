using MediatR;

namespace Qbc.Workboard.Application.Features.Workspace.Queries;

public sealed record GetWorkspaceQuery(string Route) : IRequest<WorkspaceBootstrapDto>;

