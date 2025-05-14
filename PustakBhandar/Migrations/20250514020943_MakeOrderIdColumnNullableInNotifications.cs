using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PustakBhandar.Migrations
{
    /// <inheritdoc />
    public partial class MakeOrderIdColumnNullableInNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OrderId",
                table: "Notifications",
                type: "character varying(255)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(255)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "OrderId",
                table: "Notifications",
                type: "character varying(255)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldNullable: true);
        }
    }
}
