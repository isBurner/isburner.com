interface UsageChartProps {
  data: Array<{ date: string; count: number }>;
}

export default function UsageChart({ data }: UsageChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-text-faint">
        No usage data yet
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const chartHeight = 160;
  const barWidth = Math.max(4, Math.min(16, Math.floor(600 / data.length) - 2));

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${data.length * (barWidth + 2) + 40} ${chartHeight + 30}`}
        className="w-full"
        style={{ minWidth: data.length * (barWidth + 2) + 40 }}
      >
        {/* Y-axis labels */}
        <text x="0" y="12" className="fill-text-faint" fontSize="10" fontFamily="monospace">
          {maxCount.toLocaleString()}
        </text>
        <text
          x="0"
          y={chartHeight + 2}
          className="fill-text-faint"
          fontSize="10"
          fontFamily="monospace"
        >
          0
        </text>

        {/* Bars */}
        {data.map((d, i) => {
          const barHeight = Math.max(1, (d.count / maxCount) * chartHeight);
          const x = 40 + i * (barWidth + 2);
          const y = chartHeight - barHeight;

          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={2}
                fill="#00ff88"
                opacity={0.8}
              />
              {/* Show date labels for every 7th bar */}
              {i % 7 === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-text-faint"
                  fontSize="8"
                  fontFamily="monospace"
                >
                  {d.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
