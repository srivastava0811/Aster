using System.Text;
using System.Text.Json.Serialization;
using Aster.Api.Data;
using Aster.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add DB Context (SQL Server with fallback logic)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=(localdb)\\mssqllocaldb;Database=AsterDb;Trusted_Connection=True;MultipleActiveResultSets=true";

builder.Services.AddDbContext<AsterDbContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
    });
});

// Register Application Services
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<INaturalLanguageParserService, NaturalLanguageParserService>();

// Configure Controllers & JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? "AsterSuperSecretMinimalistProductivityHubKey2026!#StudentSyllabusApp";
var issuer = jwtSettings["Issuer"] ?? "AsterApi";
var audience = jwtSettings["Audience"] ?? "AsterClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger / OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Aster API", Version = "v1", Description = "Student Syllabus & Task Injection API" });
    
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token format: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// Ensure Database Created & Seeded
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<AsterDbContext>();
        db.Database.EnsureCreated();

        // Seed initial demo student account if empty
        if (!db.Users.Any())
        {
            var demoUser = new Aster.Api.Models.User
            {
                Email = "student@aster.edu",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("aster123"),
                CreatedAt = DateTime.UtcNow
            };

            var csCourse = new Aster.Api.Models.Course { Name = "CS 101: Computer Science", ColorCode = "#4F46E5" };
            var mathCourse = new Aster.Api.Models.Course { Name = "MATH 201: Linear Algebra", ColorCode = "#14B8A6" };
            var engCourse = new Aster.Api.Models.Course { Name = "ENG 102: Literature & Composition", ColorCode = "#EF4444" };

            demoUser.Courses.Add(csCourse);
            demoUser.Courses.Add(mathCourse);
            demoUser.Courses.Add(engCourse);

            db.Users.Add(demoUser);
            db.SaveChanges();

            // Seed demo assignments
            db.Assignments.AddRange(
                new Aster.Api.Models.Assignment
                {
                    CourseId = csCourse.Id,
                    Title = "Data Structures Midterm Project",
                    DueDate = DateTime.UtcNow.AddDays(5).Date.AddHours(23).AddMinutes(59),
                    RawInjectedText = "Data Structures Midterm Project due on Friday by midnight."
                },
                new Aster.Api.Models.Assignment
                {
                    CourseId = mathCourse.Id,
                    Title = "Problem Set 4: Vector Spaces",
                    DueDate = DateTime.UtcNow.AddDays(2).Date.AddHours(17),
                    RawInjectedText = "Problem Set 4 due Wednesday 5pm."
                },
                new Aster.Api.Models.Assignment
                {
                    CourseId = engCourse.Id,
                    Title = "Research Essay Draft 1",
                    DueDate = DateTime.UtcNow.AddDays(10).Date.AddHours(23).AddMinutes(59),
                    RawInjectedText = "Research essay draft submission deadline next week."
                }
            );
            db.SaveChanges();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing/seeding the database.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
