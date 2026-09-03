using Microsoft.EntityFrameworkCore;

namespace Qbc.Workboard.Infrastructure.Persistence;

public sealed class WorkboardDbContext : DbContext, IWorkboardDbContext
{
    public WorkboardDbContext(DbContextOptions<WorkboardDbContext> options) : base(options)
    {
    }

    public IQueryable<Initiative> Initiatives => Set<Initiative>();
    public IQueryable<Epic> Epics => Set<Epic>();
    public IQueryable<Story> Stories => Set<Story>();
    public IQueryable<StoryTask> StoryTasks => Set<StoryTask>();
    public IQueryable<Assistant> Assistants => Set<Assistant>();
    public IQueryable<Sprint> Sprints => Set<Sprint>();
    public IQueryable<StoryKeySequence> StoryKeySequences => Set<StoryKeySequence>();

    public new void Add<T>(T entity) where T : class => Set<T>().Add(entity);
    public new void Remove<T>(T entity) where T : class => Set<T>().Remove(entity);

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Initiative>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Name).IsRequired();
            entity.Property(item => item.Description).IsRequired();
        });

        modelBuilder.Entity<Epic>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Name).IsRequired();
            entity.Property(item => item.Summary).IsRequired();
            entity.HasOne<Initiative>().WithMany().HasForeignKey(item => item.InitiativeId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Assistant>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.FullName).IsRequired();
            entity.Property(item => item.Role).IsRequired();
            entity.Property(item => item.SpecialtiesJson).IsRequired();
            entity.Property(item => item.Availability).HasConversion<string>();
            entity.Ignore(item => item.Specialties);
        });

        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Name).IsRequired().UseCollation("NOCASE");
            entity.Property(item => item.Goal).IsRequired();
            entity.Property(item => item.Status).HasConversion<string>();
            entity.HasIndex(item => item.Name).IsUnique();
        });

        modelBuilder.Entity<Story>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Number).IsRequired();
            entity.Ignore(item => item.Key);
            entity.Property(item => item.Title).IsRequired();
            entity.Property(item => item.Description).IsRequired();
            entity.Property(item => item.AcceptanceCriteria).IsRequired();
            entity.Property(item => item.Lifecycle).HasConversion<string>();
            entity.Property(item => item.BoardStatus).HasConversion<string>();
            entity.HasIndex(item => item.Number).IsUnique();
            entity.HasOne<Epic>().WithMany().HasForeignKey(item => item.EpicId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<Assistant>().WithMany().HasForeignKey(item => item.AssistantId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<Sprint>().WithMany().HasForeignKey(item => item.SprintId).OnDelete(DeleteBehavior.Restrict);
            entity.HasMany(item => item.Tasks).WithOne().HasForeignKey(item => item.StoryId).OnDelete(DeleteBehavior.Cascade);
            entity.Navigation(item => item.Tasks).UsePropertyAccessMode(PropertyAccessMode.Field);
        });

        modelBuilder.Entity<StoryTask>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Title).IsRequired();
            entity.HasOne<Assistant>().WithMany().HasForeignKey(item => item.AssistantId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StoryKeySequence>(entity => entity.HasKey(item => item.Id));
    }
}
