using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class RemoveMemberIdColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CartItems_AspNetUsers_MemberId",
                table: "CartItems");

            migrationBuilder.DropIndex(
                name: "IX_CartItems_MemberId",
                table: "CartItems");

            migrationBuilder.DropColumn(
                name: "MemberId",
                table: "CartItems");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MemberId",
                table: "CartItems",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_MemberId",
                table: "CartItems",
                column: "MemberId");

            migrationBuilder.AddForeignKey(
                name: "FK_CartItems_AspNetUsers_MemberId",
                table: "CartItems",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
