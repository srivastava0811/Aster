using Aster.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Aster.Api.Data
{
    public class AsterDbContext : DbContext
    {
        public AsterDbContext(DbContextOptions<AsterDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Course> Courses => Set<Course>();
        public DbSet<Assignment> Assignments => Set<Assignment>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Email).IsUnique();
                entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            });

            // Course configuration
            modelBuilder.Entity<Course>(entity =>
            {
                entity.HasOne(c => c.User)
                      .WithMany(u => u.Courses)
                      .HasForeignKey(c => c.UserId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(c => c.Name).IsRequired().HasMaxLength(100);
                entity.Property(c => c.ColorCode).IsRequired().HasMaxLength(10);
            });

            // Assignment configuration
            modelBuilder.Entity<Assignment>(entity =>
            {
                entity.HasOne(a => a.Course)
                      .WithMany(c => c.Assignments)
                      .HasForeignKey(a => a.CourseId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.Property(a => a.Title).IsRequired().HasMaxLength(250);
            });
        }
    }
}
