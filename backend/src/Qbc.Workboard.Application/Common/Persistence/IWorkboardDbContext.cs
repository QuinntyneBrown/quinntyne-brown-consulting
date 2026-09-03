
namespace Qbc.Workboard.Application.Common.Persistence;

public interface IWorkboardDbContext
{
    IQueryable<Initiative> Initiatives { get; }
    IQueryable<Epic> Epics { get; }
    IQueryable<Story> Stories { get; }
    IQueryable<StoryTask> StoryTasks { get; }
    IQueryable<Assistant> Assistants { get; }
    IQueryable<Sprint> Sprints { get; }
    IQueryable<StoryKeySequence> StoryKeySequences { get; }
    void Add<T>(T entity) where T : class;
    void Remove<T>(T entity) where T : class;
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

