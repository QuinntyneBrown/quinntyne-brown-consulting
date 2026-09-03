using MediatR;
using Microsoft.AspNetCore.Mvc;
using Qbc.Workboard.Application;

namespace Qbc.Workboard.Api;

[ApiController]
[Route("api/sprints")]
public sealed class SprintsController : ControllerBase
{
    private readonly ISender _sender;

    public SprintsController(ISender sender) => _sender = sender;

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SprintDto>>> GetAll(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetSprintsQuery(), cancellationToken));

    [HttpGet("active/board")]
    public async Task<ActionResult<ActiveSprintBoardDto?>> GetActiveBoard(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetActiveSprintBoardQuery(), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SprintDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetSprintQuery(id), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<SprintDto>> Create(SprintRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SaveSprintCommand(null, request.Name, request.Goal, request.StartDate), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<SprintDto>> Update(Guid id, SprintRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new SaveSprintCommand(id, request.Name, request.Goal, request.StartDate), cancellationToken));

    [HttpPost("{id:guid}/start")]
    public async Task<ActionResult<SprintDto>> Start(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new StartSprintCommand(id), cancellationToken));

    [HttpPost("{id:guid}/complete")]
    public async Task<ActionResult<SprintDto>> Complete(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new CompleteSprintCommand(id), cancellationToken));

    [HttpPut("{id:guid}/stories/{storyId:guid}")]
    public async Task<ActionResult<StoryDto>> AssignStory(Guid id, Guid storyId, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new AssignStoryToSprintCommand(id, storyId), cancellationToken));

    [HttpDelete("{id:guid}/stories/{storyId:guid}")]
    public async Task<ActionResult<StoryDto>> RemoveStory(Guid id, Guid storyId, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new RemoveStoryFromSprintCommand(id, storyId), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteSprintCommand(id), cancellationToken);
        return NoContent();
    }
}
