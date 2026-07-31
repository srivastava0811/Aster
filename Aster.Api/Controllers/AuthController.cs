using Aster.Api.Data;
using Aster.Api.Models;
using Aster.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aster.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AsterDbContext _dbContext;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(AsterDbContext dbContext, IJwtTokenService jwtTokenService, ILogger<AuthController> logger)
        {
            _dbContext = dbContext;
            _jwtTokenService = jwtTokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            if (await _dbContext.Users.AnyAsync(u => u.Email == normalizedEmail))
            {
                return Conflict(new { message = "An account with this email address already exists." });
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = normalizedEmail,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            // Seed default demo courses for a great first-time student experience
            user.Courses.Add(new Course { Name = "CS 101: Computer Science Fundamentals", ColorCode = "#4F46E5" });
            user.Courses.Add(new Course { Name = "MATH 201: Linear Algebra", ColorCode = "#14B8A6" });
            user.Courses.Add(new Course { Name = "ENG 102: Academic Writing", ColorCode = "#F59E0B" });

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            var token = _jwtTokenService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                UserId = user.Id
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password." });
            }

            var token = _jwtTokenService.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                UserId = user.Id
            });
        }
    }
}
