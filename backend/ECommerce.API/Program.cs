using ECommerce.API.Data;
using ECommerce.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Hata cevaplarının tamamının ProblemDetails formatında dönmesini sağlar.
builder.Services.AddProblemDetails();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))); // PostgreSQL connection

builder.Services.AddMemoryCache();
// Singleton olmalı: invalidation token'ı tüm request'ler arasında paylaşılır.
builder.Services.AddSingleton<ProductCacheTag>();

builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();

// ExceptionHandler ve StatusCodePages middleware'leri, hataları ve durum kodlarını düzgün bir şekilde yönetmek için kullanılır. Bu middleware'ler, uygulamanın hata yönetimini merkezi bir şekilde ele almasını sağlar.
app.UseExceptionHandler();
app.UseStatusCodePages();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

