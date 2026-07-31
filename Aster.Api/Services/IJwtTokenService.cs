using Aster.Api.Models;

namespace Aster.Api.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}
