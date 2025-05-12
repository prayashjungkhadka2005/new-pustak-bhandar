using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCartMemberRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carts_AspNetUsers_UserId",
                table: "Carts");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Carts",
                newName: "MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Carts_UserId",
                table: "Carts",
                newName: "IX_Carts_MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_AspNetUsers_MemberId",
                table: "Carts",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Carts_AspNetUsers_MemberId",
                table: "Carts");

            migrationBuilder.RenameColumn(
                name: "MemberId",
                table: "Carts",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Carts_MemberId",
                table: "Carts",
                newName: "IX_Carts_UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Carts_AspNetUsers_UserId",
                table: "Carts",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
