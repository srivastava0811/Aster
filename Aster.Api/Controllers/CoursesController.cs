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
    public class CoursesController : ControllerBase
    {
        private readonly AsterDbContext _dbContext;

        public CoursesController(AsterDbContext dbContext)
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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CourseDto>>> GetCourses()
        {
            var userId = GetCurrentUserId();

            var courses = await _dbContext.Courses
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CourseDto
                {
                    Id = c.Id,
                    UserId = c.UserId,
                    Name = c.Name,
                    ColorCode = c.ColorCode,
                    AssignmentCount = c.Assignments.Count,
                    CreatedAt = c.CreatedAt
                })
                .ToListAsync();

            return Ok(courses);
        }

        [HttpPost]
        public async Task<ActionResult<CourseDto>> CreateCourse([FromBody] CreateCourseDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = GetCurrentUserId();

            var course = new Course
            {
                UserId = userId,
                Name = dto.Name.Trim(),
                ColorCode = string.IsNullOrWhiteSpace(dto.ColorCode) ? "#4F46E5" : dto.ColorCode.Trim(),
                CreatedAt = DateTime.UtcNow
            };

            _dbContext.Courses.Add(course);
            await _dbContext.SaveChangesAsync();

            var result = new CourseDto
            {
                Id = course.Id,
                UserId = course.UserId,
                Name = course.Name,
                ColorCode = course.ColorCode,
                AssignmentCount = 0,
                CreatedAt = course.CreatedAt
            };

            return CreatedAtAction(nameof(GetCourses), new { id = course.Id }, result);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            var userId = GetCurrentUserId();
            var course = await _dbContext.Courses.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (course == null)
            {
                return NotFound(new { message = "Course not found." });
            }

            _dbContext.Courses.Remove(course);
            await _dbContext.SaveChangesAsync();

            return NoContent();
        }
    }
}
