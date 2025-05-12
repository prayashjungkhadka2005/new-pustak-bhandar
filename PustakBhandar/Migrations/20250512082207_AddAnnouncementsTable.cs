using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class AddAnnouncementsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberDiscount_AspNetUsers_MemberId",
                table: "MemberDiscount");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberDiscount_Discounts_DiscountId",
                table: "MemberDiscount");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MemberDiscount",
                table: "MemberDiscount");

            migrationBuilder.RenameTable(
                name: "MemberDiscount",
                newName: "MemberDiscounts");

            migrationBuilder.RenameIndex(
                name: "IX_MemberDiscount_MemberId",
                table: "MemberDiscounts",
                newName: "IX_MemberDiscounts_MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_MemberDiscount_DiscountId",
                table: "MemberDiscounts",
                newName: "IX_MemberDiscounts_DiscountId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MemberDiscounts",
                table: "MemberDiscounts",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    AdminId = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Announcements_AspNetUsers_AdminId",
                        column: x => x.AdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Announcements_AdminId",
                table: "Announcements",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberDiscounts_AspNetUsers_MemberId",
                table: "MemberDiscounts",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberDiscounts_Discounts_DiscountId",
                table: "MemberDiscounts",
                column: "DiscountId",
                principalTable: "Discounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MemberDiscounts_AspNetUsers_MemberId",
                table: "MemberDiscounts");

            migrationBuilder.DropForeignKey(
                name: "FK_MemberDiscounts_Discounts_DiscountId",
                table: "MemberDiscounts");

            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropPrimaryKey(
                name: "PK_MemberDiscounts",
                table: "MemberDiscounts");

            migrationBuilder.RenameTable(
                name: "MemberDiscounts",
                newName: "MemberDiscount");

            migrationBuilder.RenameIndex(
                name: "IX_MemberDiscounts_MemberId",
                table: "MemberDiscount",
                newName: "IX_MemberDiscount_MemberId");

            migrationBuilder.RenameIndex(
                name: "IX_MemberDiscounts_DiscountId",
                table: "MemberDiscount",
                newName: "IX_MemberDiscount_DiscountId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_MemberDiscount",
                table: "MemberDiscount",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_MemberDiscount_AspNetUsers_MemberId",
                table: "MemberDiscount",
                column: "MemberId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MemberDiscount_Discounts_DiscountId",
                table: "MemberDiscount",
                column: "DiscountId",
                principalTable: "Discounts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
