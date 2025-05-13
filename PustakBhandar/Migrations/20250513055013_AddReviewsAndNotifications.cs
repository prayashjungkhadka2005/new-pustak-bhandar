using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewsAndNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_ApplicationUserId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_AspNetUsers_MemberId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Notification_Orders_OrderId",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_AspNetUsers_AdminId",
                table: "Review");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_AspNetUsers_MemberId",
                table: "Review");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_AspNetUsers_StaffId",
                table: "Review");

            migrationBuilder.DropForeignKey(
                name: "FK_Review_Books_BookId",
                table: "Review");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Review",
                table: "Review");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.RenameTable(
                name: "Review",
                newName: "Reviews");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameIndex(
                name: "IX_Review_StaffId",
                table: "Reviews",
                newName: "IX_Reviews_StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_Review_MemberId",
                table: "Reviews",
                newName: "IX_Reviews_MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Review_BookId",
                table: "Reviews",
                newName: "IX_Reviews_BookId");

            migrationBuilder.RenameIndex(
                name: "IX_Review_AdminId",
                table: "Reviews",
                newName: "IX_Reviews_AdminId");

            migrationBuilder.RenameColumn(
                name: "ApplicationUserId",
                table: "Notifications",
                newName: "StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_OrderId",
                table: "Notifications",
                newName: "IX_Notifications_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_MemberId",
                table: "Notifications",
                newName: "IX_Notifications_MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_ApplicationUserId",
                table: "Notifications",
                newName: "IX_Notifications_StaffId");

            migrationBuilder.AddColumn<string>(
                name: "AdminId",
                table: "Notifications",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_AdminId",
                table: "Notifications",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_AdminId",
                table: "Notifications",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_MemberId",
                table: "Notifications",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_AspNetUsers_StaffId",
                table: "Notifications",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Orders_OrderId",
                table: "Notifications",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AspNetUsers_AdminId",
                table: "Reviews",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AspNetUsers_MemberId",
                table: "Reviews",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_AspNetUsers_StaffId",
                table: "Reviews",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Books_BookId",
                table: "Reviews",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_AdminId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_MemberId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_AspNetUsers_StaffId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Orders_OrderId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AspNetUsers_AdminId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AspNetUsers_MemberId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_AspNetUsers_StaffId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Books_BookId",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Reviews",
                table: "Reviews");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_AdminId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Notifications");

            migrationBuilder.RenameTable(
                name: "Reviews",
                newName: "Review");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_StaffId",
                table: "Review",
                newName: "IX_Review_StaffId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_MemberId",
                table: "Review",
                newName: "IX_Review_MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_BookId",
                table: "Review",
                newName: "IX_Review_BookId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_AdminId",
                table: "Review",
                newName: "IX_Review_AdminId");

            migrationBuilder.RenameColumn(
                name: "StaffId",
                table: "Notification",
                newName: "ApplicationUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_StaffId",
                table: "Notification",
                newName: "IX_Notification_ApplicationUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_OrderId",
                table: "Notification",
                newName: "IX_Notification_OrderId");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_MemberId",
                table: "Notification",
                newName: "IX_Notification_MemberId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Review",
                table: "Review",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_ApplicationUserId",
                table: "Notification",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_AspNetUsers_MemberId",
                table: "Notification",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_Orders_OrderId",
                table: "Notification",
                column: "OrderId",
                principalTable: "Orders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Review_AspNetUsers_AdminId",
                table: "Review",
                column: "AdminId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Review_AspNetUsers_MemberId",
                table: "Review",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Review_AspNetUsers_StaffId",
                table: "Review",
                column: "StaffId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Review_Books_BookId",
                table: "Review",
                column: "BookId",
                principalTable: "Books",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
