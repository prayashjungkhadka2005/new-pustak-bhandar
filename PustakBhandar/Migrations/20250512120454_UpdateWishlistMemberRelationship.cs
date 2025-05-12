using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWishlistMemberRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_AdminId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_StaffId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishlists_AspNetUsers_UserId",
                table: "Wishlists");

            migrationBuilder.DropIndex(
                name: "IX_Notification_AdminId",
                table: "Notification");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Notification");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Wishlists",
                newName: "MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Wishlists_UserId",
                table: "Wishlists",
                newName: "IX_Wishlists_MemberId");

            migrationBuilder.RenameColumn(
                name: "StaffId",
                table: "Notification",
                newName: "ApplicationUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_StaffId",
                table: "Notification",
                newName: "IX_Notification_ApplicationUserId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_ApplicationUserId",
                table: "Notification",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlists_AspNetUsers_MemberId",
                table: "Wishlists",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Wishlists_Staff_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Wishlists_WishlistId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_ApplicationUserId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Wishlists_AspNetUsers_MemberId",
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

            migrationBuilder.RenameColumn(
                name: "MemberId",
                table: "Wishlists",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Wishlists_MemberId",
                table: "Wishlists",
                newName: "IX_Wishlists_UserId");

            migrationBuilder.RenameColumn(
                name: "ApplicationUserId",
                table: "Notification",
                newName: "StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_ApplicationUserId",
                table: "Notification",
                newName: "IX_Notification_StaffId");

            migrationBuilder.AddColumn<string>(
                name: "AdminId",
                table: "Notification",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notification_AdminId",
                table: "Notification",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_AdminId",
                table: "Notification",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_StaffId",
                table: "Notification",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Wishlists_AspNetUsers_UserId",
                table: "Wishlists",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
