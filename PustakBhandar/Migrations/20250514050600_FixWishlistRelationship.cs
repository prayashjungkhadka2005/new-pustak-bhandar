using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class FixWishlistRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Wishlists_Staff_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Wishlists_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_Staff_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "Staff_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "WishlistId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "AdminId",
                table: "Wishlists",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StaffId",
                table: "Wishlists",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_AdminId",
                table: "Wishlists",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists",
                column: "MemberId");

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_StaffId",
                table: "Wishlists",
                column: "StaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlists_AspNetUsers_AdminId",
                table: "Wishlists",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlists_AspNetUsers_StaffId",
                table: "Wishlists",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Wishlists_AspNetUsers_AdminId",
                table: "Wishlists");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishlists_AspNetUsers_StaffId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_AdminId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Wishlists_StaffId",
                table: "Wishlists");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Wishlists");

            migrationBuilder.DropColumn(
                name: "StaffId",
                table: "Wishlists");

            migrationBuilder.AddColumn<string>(
                name: "Staff_WishlistId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WishlistId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists",
                column: "MemberId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_Staff_WishlistId",
                table: "AspNetUsers",
                column: "Staff_WishlistId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_WishlistId",
                table: "AspNetUsers",
                column: "WishlistId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Wishlists_Staff_WishlistId",
                table: "AspNetUsers",
                column: "Staff_WishlistId",
                principalTable: "Wishlists",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Wishlists_WishlistId",
                table: "AspNetUsers",
                column: "WishlistId",
                principalTable: "Wishlists",
                principalColumn: "Id");
        }
    }
}
