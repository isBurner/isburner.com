interface UsageBarProps {
  used: number;
  limit: number;
}

export default function UsageBar({ used, limit }: UsageBarProps) {
  const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isWarning = percent >= 80;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="font-mono text-sm text-text">
          {used.toLocaleString()}{' '}
          <span className="text-text-faint">/ {limit.toLocaleString()}</span>
        </span>
        <span className={`font-mono text-xs ${isWarning ? 'text-warning' : 'text-text-muted'}`}>
          {percent.toFixed(0)}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-bg-elevated">
        <div
          className={`h-full rounded-full transition-all ${isWarning ? 'bg-warning' : 'bg-accent'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
