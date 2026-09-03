using MediatR;
using Microsoft.AspNetCore.Mvc;
using Qbc.Workboard.Application;

namespace Qbc.Workboard.Api;

[ApiController]
[Route("api/stories")]
public sealed class StoriesController : ControllerBase
{
    private readonly ISender _sender;

    public StoriesController(ISender sender) => _sender = sender;

    [HttpGet("backlog")]
    public async Task<ActionResult<IReadOnlyList<StoryDto>>> GetBacklog(CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetBacklogQuery(), cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<StoryDto>> Get(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GetStoryQuery(id), cancellationToken));

    [HttpPost]
    public async Task<ActionResult<StoryDto>> Create(StoryRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(ToCommand(null, request), cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<StoryDto>> Update(Guid id, StoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(ToCommand(id, request), cancellationToken));

    [HttpPost("{id:guid}/groom")]
    public async Task<ActionResult<StoryDto>> Groom(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new GroomStoryCommand(id), cancellationToken));

    [HttpPost("{id:guid}/mark-unready")]
    public async Task<ActionResult<StoryDto>> MarkUnready(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new MarkStoryUnreadyCommand(id), cancellationToken));

    [HttpPost("{id:guid}/archive")]
    public async Task<ActionResult<StoryDto>> Archive(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new ArchiveStoryCommand(id), cancellationToken));

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<StoryDto>> Restore(Guid id, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new RestoreStoryCommand(id), cancellationToken));

    [HttpPost("{id:guid}/move")]
    public async Task<ActionResult<StoryDto>> Move(Guid id, MoveStoryRequest request, CancellationToken cancellationToken) =>
        Ok(await _sender.Send(new MoveStoryCommand(id, request.Status), cancellationToken));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteStoryCommand(id), cancellationToken);
        return NoContent();
    }

    private static SaveStoryCommand ToCommand(Guid? id, StoryRequest request) => new(
        id,
        request.EpicId,
        request.Title,
        request.Description,
        request.AcceptanceCriteria,
        request.Points,
        request.AssistantId,
        request.Tasks.Select(task => new StoryTaskDraft(task.Id, task.Title, task.IsComplete, task.AssistantId)).ToList());
}

