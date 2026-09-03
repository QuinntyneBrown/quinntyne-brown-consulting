using MediatR;

namespace Qbc.Workboard.Application.Common.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    public Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is IValidatableRequest validatable)
        {
            var errors = validatable.Validate();
            if (errors.Count > 0)
            {
                throw new RequestValidationException(errors);
            }
        }

        return next(cancellationToken);
    }
}

