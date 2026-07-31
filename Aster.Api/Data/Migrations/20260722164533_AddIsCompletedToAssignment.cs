using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aster.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsCompletedToAssignment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "Assignments",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "Assignments");
        }
    }
}
