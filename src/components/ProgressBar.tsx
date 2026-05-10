interface Props {
  value: number;
  showLabel?: boolean;
}

export default function ProgressBar({ value, showLabel = true }: Props) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct === 100 ? 'bg-emerald-500' :
    pct >= 60  ? 'bg-blue-500' :
    pct >= 30  ? 'bg-amber-500' :
                 'bg-slate-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slate-500 w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}
