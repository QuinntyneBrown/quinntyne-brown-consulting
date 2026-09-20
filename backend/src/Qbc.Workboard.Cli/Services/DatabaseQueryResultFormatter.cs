namespace Qbc.Workboard.Cli.Services;

/// <summary>Lays a result set out as aligned text columns with a row count underneath.</summary>
public static class DatabaseQueryResultFormatter
{
    private const string Separator = "  ";

    public static IEnumerable<string> Format(DatabaseQueryResult result)
    {
        if (result.Columns.Count > 0)
        {
            var widths = result.Columns
                .Select((column, index) => Math.Max(column.Length, result.Rows.Select(row => row[index].Length).DefaultIfEmpty(0).Max()))
                .ToArray();
            yield return Line(result.Columns, widths);
            yield return Line(widths.Select(width => new string('-', width)).ToArray(), widths);
            foreach (var row in result.Rows)
            {
                yield return Line(row, widths);
            }
        }

        yield return result.Rows.Count == 1 ? "(1 row)" : $"({result.Rows.Count} rows)";
    }

    private static string Line(IReadOnlyList<string> cells, int[] widths) =>
        string.Join(Separator, cells.Select((cell, index) => cell.PadRight(widths[index]))).TrimEnd();
}
