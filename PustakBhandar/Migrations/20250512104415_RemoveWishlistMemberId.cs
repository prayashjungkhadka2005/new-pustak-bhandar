using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class RemoveWishlistMemberId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wishlists_AspNetUsers_MemberId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists");

            migrationBuilder.DropColumn(
                name: "MemberId",
                table: "Wishlists");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MemberId",
                table: "Wishlists",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists",
                column: "MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlists_AspNetUsers_MemberId",
                table: "Wishlists",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
