namespace Qbc.Workboard.Application.Features.Workspace.Dtos;

public sealed record WorkspaceBootstrapDto(string Route, bool HasActiveSprint, int BacklogCount);

