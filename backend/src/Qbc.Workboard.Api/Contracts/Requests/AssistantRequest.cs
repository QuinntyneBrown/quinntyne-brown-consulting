
namespace Qbc.Workboard.Api.Contracts.Requests;

public sealed record AssistantRequest(string FullName, string Role, IReadOnlyList<string> Specialties, Availability Availability);

