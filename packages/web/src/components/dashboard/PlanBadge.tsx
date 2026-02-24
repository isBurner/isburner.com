import { TIER_CONFIG, type Tier } from '@/lib/tier-config';

export default function PlanBadge({ tier }: { tier: Tier }) {
  const isPaid = tier !== 'free';
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-xs font-medium ${
        isPaid ? 'bg-accent/15 text-accent' : 'bg-bg-elevated text-text-muted'
      }`}
    >
      {TIER_CONFIG[tier].name}
    </span>
  );
}
