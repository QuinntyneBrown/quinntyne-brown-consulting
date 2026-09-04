using MediatR;

namespace Qbc.Workboard.Application.Features.Deployment.Queries;

public sealed record GetDeploymentVersionQuery : IRequest<DeploymentVersionDto>;
