using API.Data;
using API.Extensions;
using API.Middleware;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline. 
// It is importante the order of the middleware

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors(builder => builder.WithOrigins("http://localhost:4200", "https://localhost:4200")
     .SetIsOriginAllowedToAllowWildcardSubdomains()
     .AllowAnyHeader()
     .AllowCredentials()
     .WithMethods("GET", "PUT", "POST", "DELETE", "OPTIONS")
     .SetPreflightMaxAge(TimeSpan.FromSeconds(3600))); // x or builder is the CORS Policy Builder

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

// Seeding database
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;
try
{
    var context = services.GetRequiredService<DataContext>();
    await context.Database.MigrateAsync();
    await Seed.SeedUsers(context);
    
}
catch (Exception ex)
{
    var logger = services.GetService<ILogger>();
    logger.LogError(ex, "An error occured during migration");
}

app.Run();
