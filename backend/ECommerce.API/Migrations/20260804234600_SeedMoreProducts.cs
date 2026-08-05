using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ECommerce.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedMoreProducts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Name", "Price", "StockCode", "StockQuantity" },
                values: new object[,]
                {
                    { 6, "Laptop Standı", 449.90m, "SKU-006", 140 },
                    { 7, "Full HD Webcam", 1149.00m, "SKU-007", 45 },
                    { 8, "Geniş Mousepad", 199.50m, "SKU-008", 300 },
                    { 9, "Taşınabilir SSD 1TB", 2399.00m, "SKU-009", 35 },
                    { 10, "Bluetooth Hoparlör", 1799.90m, "SKU-010", 55 },
                    { 11, "Laptop Çantası 15.6\"", 699.00m, "SKU-011", 90 },
                    { 12, "Sayısal Tuş Takımı", 549.00m, "SKU-012", 70 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 12);
        }
    }
}
