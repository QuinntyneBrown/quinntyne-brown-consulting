using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Qbc.Workboard.Api.ErrorHandling;

public sealed class ProblemDetailsExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly IHostEnvironment _environment;

    public ProblemDetailsExceptionHandler(IProblemDetailsService problemDetailsService, IHostEnvironment environment)
    {
        _problemDetailsService = problemDetailsService;
        _environment = environment;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, type, title, detail) = exception switch
        {
            RequestValidationException => (400, "urn:qbc-workboard:problem:validation", "Validation failed", exception.Message),
            NotFoundException => (404, "urn:qbc-workboard:problem:not-found", "Resource not found", exception.Message),
            ConflictException => (409, "urn:qbc-workboard:problem:conflict", "Operation conflicts with current state", exception.Message),
            DomainRuleException => (409, "urn:qbc-workboard:problem:conflict", "Operation conflicts with current state", exception.Message),
            _ => (500, "urn:qbc-workboard:problem:unexpected", "An unexpected error occurred", _environment.IsDevelopment() ? exception.Message : "The request could not be completed.")
        };

        httpContext.Response.StatusCode = status;
        var problem = new ProblemDetails { Status = status, Type = type, Title = title, Detail = detail };
        if (exception is RequestValidationException validation)
        {
            problem.Extensions["errors"] = validation.Errors;
        }
        else if (exception is ConflictException { Context: IReadOnlyList<AssignmentLinkDto> assignments })
        {
            problem.Extensions["blockingAssignments"] = assignments;
        }
        else if (exception is ConflictException { Context: not null } conflict)
        {
            problem.Extensions["context"] = conflict.Context;
        }

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problem,
            Exception = exception
        });
    }
}
