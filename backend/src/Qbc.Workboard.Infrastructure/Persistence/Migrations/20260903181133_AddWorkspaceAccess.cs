using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qbc.Workboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceAccess : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkspaceAccess",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    PasscodeHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SigningKey = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceAccess", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkspaceAccess");
        }
    }
}
