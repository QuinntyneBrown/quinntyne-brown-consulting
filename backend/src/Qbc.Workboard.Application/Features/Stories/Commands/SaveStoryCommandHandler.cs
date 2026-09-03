using MediatR;

namespace Qbc.Workboard.Application.Features.Stories.Commands;

public sealed class SaveStoryCommandHandler : IRequestHandler<SaveStoryCommand, StoryDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveStoryCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<StoryDto> Handle(SaveStoryCommand request, CancellationToken cancellationToken)
    {
        if (!_db.Epics.Any(item => item.Id == request.EpicId)) throw new NotFoundException("Epic", request.EpicId);
        ValidateAssistant(request.AssistantId);
        foreach (var task in request.Tasks) ValidateAssistant(task.AssistantId);

        Story story;
        if (request.Id is null)
        {
            var sequence = _db.StoryKeySequences.SingleOrDefault(item => item.Id == 1);
            if (sequence is null)
            {
                sequence = new StoryKeySequence(1, 101);
                _db.Add(sequence);
            }

            story = new Story(Guid.NewGuid(), sequence.TakeNext(), request.EpicId, request.Title);
            _db.Add(story);
        }
        else
        {
            story = _db.Stories.SingleOrDefault(item => item.Id == request.Id)
                ?? throw new NotFoundException("Story", request.Id);
            EnsureNotCompleted(story);
            foreach (var oldTask in _db.StoryTasks.Where(item => item.StoryId == story.Id).ToList()) _db.Remove(oldTask);
        }

        story.Update(request.EpicId, request.Title, request.Description, request.AcceptanceCriteria, request.Points, request.AssistantId);
        story.ReplaceTasks(request.Tasks.Select(task => new StoryTask(task.Id ?? Guid.NewGuid(), story.Id, task.Title, task.IsComplete, task.AssistantId)));
        await _db.SaveChangesAsync(cancellationToken);
        return StoryProjection.Create(story, _db.Epics.ToList(), _db.Initiatives.ToList(), _db.Assistants.ToList(), _db.Sprints.ToList(), story.Tasks.ToList());
    }

    private void ValidateAssistant(Guid? assistantId)
    {
        if (assistantId is not null && !_db.Assistants.Any(item => item.Id == assistantId))
        {
            throw new NotFoundException("Assistant", assistantId);
        }
    }

    private void EnsureNotCompleted(Story story)
    {
        if (story.SprintId is not null && _db.Sprints.Any(item => item.Id == story.SprintId && item.Status == SprintStatus.Completed))
        {
            throw new ConflictException("Stories retained in completed sprint history cannot be edited.");
        }
    }
}

