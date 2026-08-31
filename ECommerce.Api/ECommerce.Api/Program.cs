using ECommerce.Api.Configuration;
using ECommerce.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
//database
builder.Services.AddDatabaseConfiguration(
    builder.Configuration);
//DI
builder.Services.AddDependencyInjectionConfiguration();
builder.Services.AddJwtConfiguration(
    builder.Configuration);
//cors
builder.Services.AddCorsConfiguration();
//swagger
builder.Services.AddSwaggerConfiguration();
var app = builder.Build();
await app.SeedDatabaseAsync();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
//MİDDLEWARE
app.UseMiddleware<GlobalExceptionMiddleware>();
app.UseCors("ReactPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();