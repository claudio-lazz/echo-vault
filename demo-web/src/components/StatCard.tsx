type StatCardProps = {
  label: string;
  value: string | number;
  subLabel?: string;
};

export function StatCard({ label, value, subLabel }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-4">
      <div className="text-xs uppercase tracking-wide text-[#9AA4B2]">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subLabel && <div className="mt-1 text-xs text-[#9AA4B2]">{subLabel}</div>}
    </div>
  );
}
