using System.Security.Claims;
using Aster.Api.Data;
using Aster.Api.Models;
using Aster.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aster.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class AssignmentsController : ControllerBase
    {
        private readonly AsterDbContext _dbContext;
        private readonly INaturalLanguageParserService _parserService;
        private readonly ILogger<AssignmentsController> _logger;

        public AssignmentsController(
            AsterDbContext dbContext,
            INaturalLanguageParserService parserService,
            ILogger<AssignmentsController> logger)
        {
            _dbContext = dbContext;
            _parserService = parserService;
            _logger = logger;
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

        [HttpPost("parse")]
        public async Task<ActionResult<List<ParseAssignmentResponseDto>>> ParseAssignment([FromBody] ParseAssignmentRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var courseExists = await _dbContext.Courses.AnyAsync(c => c.Id == request.CourseId && c.UserId == userId);

            if (!courseExists)
            {
                return NotFound(new { message = "Course not found or access denied." });
            }

            var results = await _parserService.ParseSyllabusTextAsync(request.RawText);
            return Ok(results);
        }

        [HttpPost]
        public async Task<ActionResult<AssignmentDto>> CreateAssignment([FromBody] CreateAssignmentDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();
            var course = await _dbContext.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.UserId == userId);

            if (course == null)
            {
                return NotFound(new { message = "Course not found or access denied." });
            }

            var assignment = new Assignment
            {
                CourseId = dto.CourseId,
                Title = dto.Title.Trim(),
                DueDate = dto.DueDate,
                RawInjectedText = dto.RawInjectedText,
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Assignments.Add(assignment);
            await _dbContext.SaveChangesAsync();

            var responseDto = new AssignmentDto
            {
                Id = assignment.Id,
                CourseId = assignment.CourseId,
                CourseName = course.Name,
                CourseColorCode = course.ColorCode,
                Title = assignment.Title,
                DueDate = assignment.DueDate,
                RawInjectedText = assignment.RawInjectedText,
                IsCompleted = assignment.IsCompleted,
                CreatedAt = assignment.CreatedAt
            };

            return CreatedAtAction(nameof(GetAssignments), new { id = assignment.Id }, responseDto);
        }

        [HttpPost("bulk")]
        public async Task<ActionResult<List<AssignmentDto>>> CreateAssignmentsBulk([FromBody] List<CreateAssignmentDto> dtos)
        {
            if (dtos == null || !dtos.Any())
            {
                return BadRequest(new { message = "No assignments provided to create." });
            }

            var userId = GetCurrentUserId();
            var firstCourseId = dtos.First().CourseId;
            var course = await _dbContext.Courses.FirstOrDefaultAsync(c => c.Id == firstCourseId && c.UserId == userId);

            if (course == null)
            {
                return NotFound(new { message = "Course not found or access denied." });
            }

            var assignments = dtos.Select(dto => new Assignment
            {
                CourseId = dto.CourseId,
                Title = dto.Title.Trim(),
                DueDate = dto.DueDate,
                RawInjectedText = dto.RawInjectedText,
                IsCompleted = dto.IsCompleted,
                CreatedAt = DateTime.UtcNow
            }).ToList();

            _dbContext.Assignments.AddRange(assignments);
            await _dbContext.SaveChangesAsync();

            var responseDtos = assignments.Select(a => new AssignmentDto
            {
                Id = a.Id,
                CourseId = a.CourseId,
                CourseName = course.Name,
                CourseColorCode = course.ColorCode,
                Title = a.Title,
                DueDate = a.DueDate,
                RawInjectedText = a.RawInjectedText,
                IsCompleted = a.IsCompleted,
                CreatedAt = a.CreatedAt
            }).ToList();

            return Ok(responseDtos);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<AssignmentDto>>> GetAssignments(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var userId = GetCurrentUserId();

            var query = _dbContext.Assignments
                .Include(a => a.Course)
                .Where(a => a.Course!.UserId == userId);

            if (startDate.HasValue)
            {
                query = query.Where(a => a.DueDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(a => a.DueDate <= endDate.Value);
            }

            var assignments = await query
                .OrderBy(a => a.DueDate)
                .Select(a => new AssignmentDto
                {
                    Id = a.Id,
                    CourseId = a.CourseId,
                    CourseName = a.Course!.Name,
                    CourseColorCode = a.Course.ColorCode,
                    Title = a.Title,
                    DueDate = a.DueDate,
                    RawInjectedText = a.RawInjectedText,
                    IsCompleted = a.IsCompleted,
                    CreatedAt = a.CreatedAt
                })
                .ToListAsync();

            return Ok(assignments);
        }

        [HttpPut("{id:guid}/toggle-complete")]
        public async Task<ActionResult<AssignmentDto>> ToggleComplete(Guid id)
        {
            var userId = GetCurrentUserId();
            var assignment = await _dbContext.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id && a.Course!.UserId == userId);

            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found." });
            }

            assignment.IsCompleted = !assignment.IsCompleted;
            await _dbContext.SaveChangesAsync();

            var responseDto = new AssignmentDto
            {
                Id = assignment.Id,
                CourseId = assignment.CourseId,
                CourseName = assignment.Course!.Name,
                CourseColorCode = assignment.Course.ColorCode,
                Title = assignment.Title,
                DueDate = assignment.DueDate,
                RawInjectedText = assignment.RawInjectedText,
                IsCompleted = assignment.IsCompleted,
                CreatedAt = assignment.CreatedAt
            };

            return Ok(responseDto);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteAssignment(Guid id)
        {
            var userId = GetCurrentUserId();
            var assignment = await _dbContext.Assignments
                .Include(a => a.Course)
                .FirstOrDefaultAsync(a => a.Id == id && a.Course!.UserId == userId);

            if (assignment == null)
            {
                return NotFound(new { message = "Assignment not found." });
            }

            _dbContext.Assignments.Remove(assignment);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
