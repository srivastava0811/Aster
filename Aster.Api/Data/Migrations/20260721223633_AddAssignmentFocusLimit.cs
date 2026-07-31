using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Aster.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAssignmentFocusLimit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignmentFocusLimit",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 5);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AssignmentFocusLimit",
                table: "Users");
        }
    }
}
