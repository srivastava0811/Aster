using System.ComponentModel.DataAnnotations;

namespace Aster.Api.Models
{
    public class RegisterRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequestDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public Guid UserId { get; set; }
    }

    public class CreateCourseDto
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public string ColorCode { get; set; } = "#4F46E5";
    }

    public class CourseDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ColorCode { get; set; } = string.Empty;
        public int AssignmentCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ParseAssignmentRequestDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public string RawText { get; set; } = string.Empty;
    }

    public class ParseAssignmentResponseDto
    {
        public string ParsedTitle { get; set; } = string.Empty;
        public DateTime ParsedDueDate { get; set; }
        public float ConfidenceScore { get; set; }
        public string? ExtractedNotes { get; set; }
    }

    public class CreateAssignmentDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public DateTime DueDate { get; set; }

        public string? RawInjectedText { get; set; }
        public bool IsCompleted { get; set; } = false;
    }

    public class AssignmentDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = string.Empty;
        public string CourseColorCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string? RawInjectedText { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UserSettingsDto
    {
        public string Email { get; set; } = string.Empty;
        public DateTime? SemesterStartDate { get; set; }
        public DateTime? SemesterEndDate { get; set; }
        public int NotificationLeadTimeHours { get; set; } = 24;
        public bool WeeklyDigestEnabled { get; set; } = false;
        public string? DefaultDueTime { get; set; } = "23:59";
        public bool StrictValidationEnabled { get; set; } = true;
        public int AssignmentFocusLimit { get; set; } = 5;
    }

    public class UpdateUserSettingsDto
    {
        public DateTime? SemesterStartDate { get; set; }
        public DateTime? SemesterEndDate { get; set; }
        public int NotificationLeadTimeHours { get; set; } = 24;
        public bool WeeklyDigestEnabled { get; set; } = false;
        public string? DefaultDueTime { get; set; } = "23:59";
        public bool StrictValidationEnabled { get; set; } = true;
        public int AssignmentFocusLimit { get; set; } = 5;
    }

    public class UpdatePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UserDataExportDto
    {
        public DateTime ExportedAt { get; set; } = DateTime.UtcNow;
        public UserSettingsDto UserSettings { get; set; } = new UserSettingsDto();
        public List<CourseExportDto> Courses { get; set; } = new List<CourseExportDto>();
    }

    public class CourseExportDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ColorCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<AssignmentExportDto> Assignments { get; set; } = new List<AssignmentExportDto>();
    }

    public class AssignmentExportDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime DueDate { get; set; }
        public string? RawInjectedText { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
