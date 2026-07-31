using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Aster.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Aster.Api.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"] ?? "AsterSuperSecretDefaultSecurityKey2026!#AsterHub";
            var issuer = jwtSettings["Issuer"] ?? "AsterApi";
            var audience = jwtSettings["Audience"] ?? "AsterClient";
            var expiryInMinutes = double.TryParse(jwtSettings["ExpiryMinutes"], out var mins) ? mins : 1440;

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expiryInMinutes),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
