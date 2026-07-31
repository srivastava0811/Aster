using Aster.Api.Models;

namespace Aster.Api.Services
{
    public interface INaturalLanguageParserService
    {
        Task<List<ParseAssignmentResponseDto>> ParseSyllabusTextAsync(string rawText);
    }
}
