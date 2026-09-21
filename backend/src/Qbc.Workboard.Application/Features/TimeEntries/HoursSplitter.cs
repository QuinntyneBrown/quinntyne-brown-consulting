namespace Qbc.Workboard.Application.Features.TimeEntries;

/// <summary>
/// Divides one total across a group of stories the way `L2-058` states: every story receives the
/// largest quarter-hour share that fits, and whatever is left over lands on the first story, so
/// the shares always add up to exactly the total entered.
/// </summary>
public static class HoursSplitter
{
    public const decimal Increment = 0.25m;

    public static IReadOnlyList<decimal> Split(decimal total, int count)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(count, 1);
        var baseShare = Math.Floor(total / count / Increment) * Increment;
        var shares = new decimal[count];
        Array.Fill(shares, baseShare);
        shares[0] = total - baseShare * (count - 1);
        return shares;
    }
}
