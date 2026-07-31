using System.Security.Claims;
using Aster.Api.Data;
using Aster.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aster.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AsterDbContext _dbContext;

        public UsersController(AsterDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        private Guid GetCurrentUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            throw new UnauthorizedAccessException("Invalid User ID in token.");
        }

        [HttpGet("settings")]
        public async Task<ActionResult<UserSettingsDto>> GetSettings()
        {
            var userId = GetCurrentUserId();
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var dto = new UserSettingsDto
            {
                Email = user.Email,
                SemesterStartDate = user.SemesterStartDate,
                SemesterEndDate = user.SemesterEndDate,
                NotificationLeadTimeHours = user.NotificationLeadTimeHours,
                WeeklyDigestEnabled = user.WeeklyDigestEnabled,
                DefaultDueTime = user.DefaultDueTime.HasValue ? user.DefaultDueTime.Value.ToString(@"hh\:mm") : "23:59",
                StrictValidationEnabled = user.StrictValidationEnabled,
                AssignmentFocusLimit = user.AssignmentFocusLimit
            };

            return Ok(dto);
        }

        [HttpPut("settings")]
        public async Task<ActionResult<UserSettingsDto>> UpdateSettings([FromBody] UpdateUserSettingsDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            user.SemesterStartDate = dto.SemesterStartDate;
            user.SemesterEndDate = dto.SemesterEndDate;
            user.NotificationLeadTimeHours = dto.NotificationLeadTimeHours;
            user.WeeklyDigestEnabled = dto.WeeklyDigestEnabled;
            user.StrictValidationEnabled = dto.StrictValidationEnabled;
            user.AssignmentFocusLimit = dto.AssignmentFocusLimit > 0 ? dto.AssignmentFocusLimit : 5;

            if (!string.IsNullOrWhiteSpace(dto.DefaultDueTime) && TimeSpan.TryParse(dto.DefaultDueTime, out var parsedTime))
            {
                user.DefaultDueTime = parsedTime;
            }

            await _dbContext.SaveChangesAsync();

            var updatedDto = new UserSettingsDto
            {
                Email = user.Email,
                SemesterStartDate = user.SemesterStartDate,
                SemesterEndDate = user.SemesterEndDate,
                NotificationLeadTimeHours = user.NotificationLeadTimeHours,
                WeeklyDigestEnabled = user.WeeklyDigestEnabled,
                DefaultDueTime = user.DefaultDueTime.HasValue ? user.DefaultDueTime.Value.ToString(@"hh\:mm") : "23:59",
                StrictValidationEnabled = user.StrictValidationEnabled,
                AssignmentFocusLimit = user.AssignmentFocusLimit
            };

            return Ok(updatedDto);
        }

        [HttpPut("password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            {
                return BadRequest(new { message = "Incorrect current password." });
            }

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _dbContext.SaveChangesAsync();

            return Ok(new { message = "Password updated successfully." });
        }

        [HttpGet("export")]
        public async Task<ActionResult<UserDataExportDto>> ExportAcademicData()
        {
            var userId = GetCurrentUserId();

            var user = await _dbContext.Users
                .Include(u => u.Courses)
                    .ThenInclude(c => c.Assignments)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
            {
                return NotFound(new { message = "User not found." });
            }

            var exportDto = new UserDataExportDto
            {
                ExportedAt = DateTime.UtcNow,
                UserSettings = new UserSettingsDto
                {
                    Email = user.Email,
                    SemesterStartDate = user.SemesterStartDate,
                    SemesterEndDate = user.SemesterEndDate,
                    NotificationLeadTimeHours = user.NotificationLeadTimeHours,
                    WeeklyDigestEnabled = user.WeeklyDigestEnabled,
                    DefaultDueTime = user.DefaultDueTime.HasValue ? user.DefaultDueTime.Value.ToString(@"hh\:mm") : "23:59",
                    StrictValidationEnabled = user.StrictValidationEnabled,
                    AssignmentFocusLimit = user.AssignmentFocusLimit
                },
                Courses = user.Courses.Select(c => new CourseExportDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    ColorCode = c.ColorCode,
                    CreatedAt = c.CreatedAt,
                    Assignments = c.Assignments.Select(a => new AssignmentExportDto
                    {
                        Id = a.Id,
                        Title = a.Title,
                        DueDate = a.DueDate,
                        RawInjectedText = a.RawInjectedText,
                        CreatedAt = a.CreatedAt
                    }).ToList()
                }).ToList()
            };

            return Ok(exportDto);
        }
    }
}
