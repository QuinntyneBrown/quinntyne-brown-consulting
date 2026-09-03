using MediatR;

namespace Qbc.Workboard.Application.Features.Hierarchy.Queries;

public sealed record GetHierarchyQuery : IRequest<HierarchyDto>;

