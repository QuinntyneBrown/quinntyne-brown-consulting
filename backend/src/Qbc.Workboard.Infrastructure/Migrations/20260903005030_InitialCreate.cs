using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Qbc.Workboard.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Assistant",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    FullName = table.Column<string>(type: "TEXT", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: false),
                    SpecialtiesJson = table.Column<string>(type: "TEXT", nullable: false),
                    Availability = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assistant", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Initiative",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Initiative", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sprint",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false, collation: "NOCASE"),
                    Goal = table.Column<string>(type: "TEXT", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sprint", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "StoryKeySequence",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NextNumber = table.Column<long>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoryKeySequence", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Epic",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    InitiativeId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Summary = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Epic", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Epic_Initiative_InitiativeId",
                        column: x => x.InitiativeId,
                        principalTable: "Initiative",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Story",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    Number = table.Column<long>(type: "INTEGER", nullable: false),
                    EpicId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    AcceptanceCriteria = table.Column<string>(type: "TEXT", nullable: false),
                    Points = table.Column<int>(type: "INTEGER", nullable: true),
                    AssistantId = table.Column<Guid>(type: "TEXT", nullable: true),
                    Lifecycle = table.Column<string>(type: "TEXT", nullable: false),
                    IsReady = table.Column<bool>(type: "INTEGER", nullable: false),
                    SprintId = table.Column<Guid>(type: "TEXT", nullable: true),
                    BoardStatus = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Story", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Story_Assistant_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Assistant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Story_Epic_EpicId",
                        column: x => x.EpicId,
                        principalTable: "Epic",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Story_Sprint_SprintId",
                        column: x => x.SprintId,
                        principalTable: "Sprint",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StoryTask",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    StoryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Title = table.Column<string>(type: "TEXT", nullable: false),
                    IsComplete = table.Column<bool>(type: "INTEGER", nullable: false),
                    AssistantId = table.Column<Guid>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoryTask", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoryTask_Assistant_AssistantId",
                        column: x => x.AssistantId,
                        principalTable: "Assistant",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_StoryTask_Story_StoryId",
                        column: x => x.StoryId,
                        principalTable: "Story",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Epic_InitiativeId",
                table: "Epic",
                column: "InitiativeId");

            migrationBuilder.CreateIndex(
                name: "IX_Sprint_Name",
                table: "Sprint",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Story_AssistantId",
                table: "Story",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_Story_EpicId",
                table: "Story",
                column: "EpicId");

            migrationBuilder.CreateIndex(
                name: "IX_Story_Number",
                table: "Story",
                column: "Number",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Story_SprintId",
                table: "Story",
                column: "SprintId");

            migrationBuilder.CreateIndex(
                name: "IX_StoryTask_AssistantId",
                table: "StoryTask",
                column: "AssistantId");

            migrationBuilder.CreateIndex(
                name: "IX_StoryTask_StoryId",
                table: "StoryTask",
                column: "StoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StoryKeySequence");

            migrationBuilder.DropTable(
                name: "StoryTask");

            migrationBuilder.DropTable(
                name: "Story");

            migrationBuilder.DropTable(
                name: "Assistant");

            migrationBuilder.DropTable(
                name: "Epic");

            migrationBuilder.DropTable(
                name: "Sprint");

            migrationBuilder.DropTable(
                name: "Initiative");
        }
    }
}
