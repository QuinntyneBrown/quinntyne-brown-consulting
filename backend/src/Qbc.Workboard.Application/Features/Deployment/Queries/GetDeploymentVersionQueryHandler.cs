using MediatR;

namespace Qbc.Workboard.Application.Features.Deployment.Queries;

public sealed class GetDeploymentVersionQueryHandler : IRequestHandler<GetDeploymentVersionQuery, DeploymentVersionDto>
{
    private readonly IDeploymentInformation _deployment;

    public GetDeploymentVersionQueryHandler(IDeploymentInformation deployment)
    {
        _deployment = deployment;
    }

    public Task<DeploymentVersionDto> Handle(GetDeploymentVersionQuery request, CancellationToken cancellationToken)
    {
        return Task.FromResult(new DeploymentVersionDto(_deployment.Version, _deployment.Commit));
    }
}
