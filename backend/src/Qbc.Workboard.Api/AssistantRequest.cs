using Qbc.Workboard.Domain;

namespace Qbc.Workboard.Api;

public sealed record AssistantRequest(string FullName, string Role, IReadOnlyList<string> Specialties, Availability Availability);

