using System.Text.Json;
using System.Text.RegularExpressions;
using Aster.Api.Models;
using Azure;
using Azure.AI.OpenAI;

namespace Aster.Api.Services
{
    public class NaturalLanguageParserService : INaturalLanguageParserService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<NaturalLanguageParserService> _logger;

        public NaturalLanguageParserService(IConfiguration configuration, ILogger<NaturalLanguageParserService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<List<ParseAssignmentResponseDto>> ParseSyllabusTextAsync(string rawText)
        {
            if (string.IsNullOrWhiteSpace(rawText))
            {
                return new List<ParseAssignmentResponseDto>();
            }

            var openAiKey = _configuration["OpenAI:ApiKey"];
            var openAiEndpoint = _configuration["OpenAI:Endpoint"];
            var deploymentOrModel = _configuration["OpenAI:DeploymentName"] ?? "gpt-4o-mini";

            if (!string.IsNullOrEmpty(openAiKey))
            {
                try
                {
                    OpenAIClient client = string.IsNullOrEmpty(openAiEndpoint)
                        ? new OpenAIClient(openAiKey)
                        : new OpenAIClient(new Uri(openAiEndpoint), new AzureKeyCredential(openAiKey));

                    var systemPrompt = @"You are an expert academic text parser for university students.
Extract ALL assignments, exams, quizzes, readings, lab reports, projects, and deadlines from the provided course syllabus text.
Output MUST be a JSON array of objects with this exact schema:
[
  {
    ""title"": ""Clear concise assignment/exam title"",
    ""dueDateIso"": ""YYYY-MM-DDTHH:mm:ss"",
    ""confidenceScore"": 0.95,
    ""notes"": ""Optional extracted context or description""
  }
]
If no explicit time of day is mentioned, default the due time to 23:59:00. Output ONLY raw valid JSON array, with no extra markdown formatting.";

                    var chatOptions = new ChatCompletionsOptions
                    {
                        DeploymentName = deploymentOrModel,
                        Messages =
                        {
                            new ChatRequestSystemMessage(systemPrompt),
                            new ChatRequestUserMessage($"Full Course Syllabus Text:\n\"\"\"{rawText}\"\"\"")
                        },
                        Temperature = 0.1f,
                        MaxTokens = 1500
                    };

                    Response<ChatCompletions> response = await client.GetChatCompletionsAsync(chatOptions);
                    var completionText = response.Value.Choices[0].Message.Content;

                    var jsonText = Regex.Replace(completionText, @"```json|```", "").Trim();
                    using var doc = JsonDocument.Parse(jsonText);
                    
                    var results = new List<ParseAssignmentResponseDto>();

                    if (doc.RootElement.ValueKind == JsonValueKind.Array)
                    {
                        foreach (var element in doc.RootElement.EnumerateArray())
                        {
                            var title = element.TryGetProperty("title", out var tProp) ? tProp.GetString() : null;
                            var dateStr = element.TryGetProperty("dueDateIso", out var dProp) ? dProp.GetString() : null;
                            var confidence = element.TryGetProperty("confidenceScore", out var cProp) ? (float)cProp.GetDouble() : 0.9f;
                            var notes = element.TryGetProperty("notes", out var nProp) ? nProp.GetString() : null;

                            if (!string.IsNullOrEmpty(title) && DateTime.TryParse(dateStr, out var parsedDate))
                            {
                                results.Add(new ParseAssignmentResponseDto
                                {
                                    ParsedTitle = title.Trim(),
                                    ParsedDueDate = DateTime.SpecifyKind(parsedDate, DateTimeKind.Unspecified),
                                    ConfidenceScore = Math.Clamp(confidence, 0.5f, 1.0f),
                                    ExtractedNotes = notes
                                });
                            }
                        }

                        if (results.Count > 0)
                        {
                            return results;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "OpenAI API call failed or failed to parse response. Falling back to heuristic NLP parser.");
                }
            }

            // Fallback smart heuristic NLP parser
            return ParseWithHeuristics(rawText);
        }

        private List<ParseAssignmentResponseDto> ParseWithHeuristics(string rawText)
        {
            var list = new List<ParseAssignmentResponseDto>();
            var lines = rawText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var cleanLine = line.Trim();
                if (cleanLine.Length < 5) continue;

                // Match date patterns
                var dateMatch = Regex.Match(cleanLine, @"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,\s*\d{4})?", RegexOptions.IgnoreCase);
                var shortDateMatch = Regex.Match(cleanLine, @"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b");
                var relativeMatch = Regex.Match(cleanLine, @"\b(today|tomorrow|next week|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\b", RegexOptions.IgnoreCase);

                DateTime extractedDate = DateTime.SpecifyKind(DateTime.Now.AddDays(7).Date.AddHours(23).AddMinutes(59), DateTimeKind.Unspecified);
                bool dateFound = false;

                if (dateMatch.Success && DateTime.TryParse(dateMatch.Value, out var dt1))
                {
                    var target = dt1 > DateTime.Now ? dt1 : dt1.AddYears(1);
                    extractedDate = DateTime.SpecifyKind(target.Date.AddHours(23).AddMinutes(59), DateTimeKind.Unspecified);
                    dateFound = true;
                }
                else if (shortDateMatch.Success && DateTime.TryParse(shortDateMatch.Value, out var dt2))
                {
                    var target = dt2 > DateTime.Now ? dt2 : dt2.AddYears(1);
                    extractedDate = DateTime.SpecifyKind(target.Date.AddHours(23).AddMinutes(59), DateTimeKind.Unspecified);
                    dateFound = true;
                }
                else if (relativeMatch.Success)
                {
                    var rel = relativeMatch.Value.ToLower();
                    var baseDate = DateTime.Now;
                    if (rel == "today") baseDate = DateTime.Now;
                    else if (rel == "tomorrow") baseDate = DateTime.Now.AddDays(1);
                    else if (rel == "next week") baseDate = DateTime.Now.AddDays(7);
                    extractedDate = DateTime.SpecifyKind(baseDate.Date.AddHours(23).AddMinutes(59), DateTimeKind.Unspecified);
                    dateFound = true;
                }

                // If a line contains assignment terms OR has a valid date, extract it
                var titleMatch = Regex.Match(cleanLine, @"(?i)\b(exam|quiz|test|midterm|final|project|homework|paper|essay|presentation|lab|reading|assignment|task|ch(?:apter)?\s*\d+)\b[^\n,.:;]*");

                if (dateFound || titleMatch.Success)
                {
                    string title = titleMatch.Success
                        ? System.Globalization.CultureInfo.CurrentCulture.TextInfo.ToTitleCase(titleMatch.Value.Trim())
                        : (cleanLine.Length > 50 ? cleanLine.Substring(0, 47) + "..." : cleanLine);

                    list.Add(new ParseAssignmentResponseDto
                    {
                        ParsedTitle = title,
                        ParsedDueDate = extractedDate,
                        ConfidenceScore = dateFound ? 0.85f : 0.70f,
                        ExtractedNotes = cleanLine
                    });
                }
            }

            // Fallback if no specific line items found
            if (list.Count == 0)
            {
                var cleanText = rawText.Trim();
                var firstLine = cleanText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries).FirstOrDefault() ?? "Assignment Task";

                list.Add(new ParseAssignmentResponseDto
                {
                    ParsedTitle = firstLine.Length > 50 ? firstLine.Substring(0, 47) + "..." : firstLine,
                    ParsedDueDate = DateTime.SpecifyKind(DateTime.Now.AddDays(7).Date.AddHours(23).AddMinutes(59), DateTimeKind.Unspecified),
                    ConfidenceScore = 0.65f,
                    ExtractedNotes = "Extracted via Aster Syllabus Engine"
                });
            }

            return list;
        }
    }
}
