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
    public IQueryable<TimeEntry> TimeEntries => Set<TimeEntry>();
    public IQueryable<Sprint> Sprints => Set<Sprint>();
    public IQueryable<StoryKeySequence> StoryKeySequences => Set<StoryKeySequence>();
    public IQueryable<WorkspaceAccess> WorkspaceAccess => Set<WorkspaceAccess>();

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
            entity.Property(item => item.Name).IsRequired();
            if (Database.IsSqlServer())
            {
                // A database-level backstop behind the handler's own case-insensitive check.
                entity.Property(item => item.Name).UseCollation("SQL_Latin1_General_CP1_CI_AS");
            }

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

        modelBuilder.Entity<TimeEntry>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Note).IsRequired();
            // Quarter hours in a working day need two decimal places; the default would be inherited.
            entity.Property(item => item.Hours).HasPrecision(5, 2);
            // Deleting a story takes its entries with it. Deleting an assistant does not: the hours
            // they logged are the record of who did the work, so the delete is refused instead.
            entity.HasOne<Story>().WithMany().HasForeignKey(item => item.StoryId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne<Assistant>().WithMany().HasForeignKey(item => item.AssistantId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StoryKeySequence>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).ValueGeneratedNever();
        });

        modelBuilder.Entity<WorkspaceAccess>(entity =>
        {
            entity.HasKey(item => item.Id);
            entity.Property(item => item.Id).ValueGeneratedNever();
            entity.Property(item => item.PasscodeHash).IsRequired();
            entity.Property(item => item.SigningKey).IsRequired();
        });
    }
}
