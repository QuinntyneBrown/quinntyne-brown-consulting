using MediatR;

namespace Qbc.Workboard.Application.Features.Assistants.Commands;

public sealed class SaveAssistantCommandHandler : IRequestHandler<SaveAssistantCommand, AssistantDto>
{
    private readonly IWorkboardDbContext _db;

    public SaveAssistantCommandHandler(IWorkboardDbContext db) => _db = db;

    public async Task<AssistantDto> Handle(SaveAssistantCommand request, CancellationToken cancellationToken)
    {
        Assistant assistant;
        if (request.Id is null)
        {
            assistant = new Assistant(Guid.NewGuid(), request.FullName, request.Role, request.Specialties, request.Availability);
            _db.Add(assistant);
        }
        else
        {
            assistant = _db.Assistants.SingleOrDefault(item => item.Id == request.Id)
                ?? throw new NotFoundException("Assistant", request.Id);
            assistant.Update(request.FullName, request.Role, request.Specialties, request.Availability);
        }

        await _db.SaveChangesAsync(cancellationToken);
        return AssistantProjection.Create(assistant, _db.Stories.ToList(), _db.StoryTasks.ToList());
    }
}

