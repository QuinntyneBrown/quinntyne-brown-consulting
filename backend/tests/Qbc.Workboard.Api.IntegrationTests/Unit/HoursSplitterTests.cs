using Qbc.Workboard.Application.Features.TimeEntries;
using Xunit;

namespace Qbc.Workboard.Api.IntegrationTests.Unit;

/// <summary>
/// The division rule `L2-058` states, pinned on its own so the acceptance tests can spend their
/// assertions on what is persisted rather than on arithmetic.
/// </summary>
public sealed class HoursSplitterTests
{
    [Theory]
    [InlineData(3, 2, new[] { 1.5, 1.5 })]
    [InlineData(5, 3, new[] { 2.0, 1.5, 1.5 })]
    [InlineData(1, 3, new[] { 0.5, 0.25, 0.25 })]
    [InlineData(24, 1, new[] { 24.0 })]
    [InlineData(0.75, 3, new[] { 0.25, 0.25, 0.25 })]
    [InlineData(2.25, 4, new[] { 0.75, 0.5, 0.5, 0.5 })]
    public void L2_058_Divides_a_total_with_the_remainder_on_the_first_story(double total, int count, double[] expected)
    {
        var shares = HoursSplitter.Split((decimal)total, count);

        Assert.Equal(expected.Select(item => (decimal)item), shares);
    }

    [Fact]
    public void L2_058_Every_division_accounts_for_the_whole_total_in_positive_quarter_hours()
    {
        for (var count = 1; count <= 8; count++)
        {
            for (var total = 0.25m * count; total <= 24m; total += 0.25m)
            {
                var shares = HoursSplitter.Split(total, count);

                Assert.Equal(count, shares.Count);
                Assert.Equal(total, shares.Sum());
                Assert.All(shares, share => Assert.True(share >= 0.25m && share % 0.25m == 0, $"{total}/{count} gave {share}"));
                Assert.All(shares.Skip(1), share => Assert.True(share <= shares[0], "the first story carries the remainder"));
            }
        }
    }

    [Fact]
    public void L2_058_Refuses_a_group_of_no_stories()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => HoursSplitter.Split(1m, 0));
    }
}
