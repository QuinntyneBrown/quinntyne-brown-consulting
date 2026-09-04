using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qbc.Workboard.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTimeEntry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TimeEntry",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    AssistantId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WorkedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    Hours = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimeEntry_Assistant_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Assistant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TimeEntry_Story_StoryId",
                        column: x => x.StoryId,
                        principalTable: "Story",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntry_AssistantId",
                table: "TimeEntry",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_TimeEntry_StoryId",
                table: "TimeEntry",
                column: "StoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimeEntry");
        }
    }
}
