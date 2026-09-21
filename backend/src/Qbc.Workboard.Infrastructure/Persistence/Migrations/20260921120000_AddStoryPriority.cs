using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qbc.Workboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStoryPriority : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Priority",
                table: "Story",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "None");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Priority",
                table: "Story");
        }
    }
}
