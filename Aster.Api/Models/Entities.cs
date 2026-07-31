using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Aster.Api.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [EmailAddress]
        [MaxLength(256)]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Settings / Configuration Fields
        public DateTime? SemesterStartDate { get; set; }
        public DateTime? SemesterEndDate { get; set; }
        public int NotificationLeadTimeHours { get; set; } = 24;
        public bool WeeklyDigestEnabled { get; set; } = false;
        public TimeSpan? DefaultDueTime { get; set; } = new TimeSpan(23, 59, 00);
        public bool StrictValidationEnabled { get; set; } = true;
        public int AssignmentFocusLimit { get; set; } = 5;

        [JsonIgnore]
        public ICollection<Course> Courses { get; set; } = new List<Course>();
    }

    public class Course
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [JsonIgnore]
        public User? User { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string ColorCode { get; set; } = "#4F46E5";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    }

    public class Assignment
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid CourseId { get; set; }

        [JsonIgnore]
        public Course? Course { get; set; }

        [Required]
        [MaxLength(250)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime DueDate { get; set; }

        public string? RawInjectedText { get; set; }

        public bool IsCompleted { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
