using System.Text.Json;

namespace Qbc.Workboard.Domain.Entities;

public sealed class Assistant
{
    private Assistant()
    {
    }

    public Assistant(Guid id, string fullName, string role, IEnumerable<string> specialties, Availability availability)
    {
        Id = id;
        Update(fullName, role, specialties, availability);
    }

    public Guid Id { get; private set; }
    public string FullName { get; private set; } = string.Empty;
    public string Role { get; private set; } = string.Empty;
    public string SpecialtiesJson { get; private set; } = "[]";
    public Availability Availability { get; private set; }
    public IReadOnlyList<string> Specialties => JsonSerializer.Deserialize<string[]>(SpecialtiesJson) ?? [];

    public void Update(string fullName, string role, IEnumerable<string> specialties, Availability availability)
    {
        FullName = fullName.Trim();
        Role = role.Trim();
        SpecialtiesJson = JsonSerializer.Serialize(
            specialties.Select(value => value.Trim()).Where(value => value.Length > 0).Distinct(StringComparer.OrdinalIgnoreCase));
        Availability = availability;
    }
}

