using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class RemoveAdminIdFromOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_AspNetUsers_AdminId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_AdminId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Orders");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminId",
                table: "Orders",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_AdminId",
                table: "Orders",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_AspNetUsers_AdminId",
                table: "Orders",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
