type StatusPillProps = {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
};

const toneStyles: Record<string, string> = {
  success: 'bg-[#13251d] text-[#18C964] border-[#1b3b2b]',
  warning: 'bg-[#2a2010] text-[#F5A524] border-[#3b2b10]',
  danger: 'bg-[#2a141c] text-[#F31260] border-[#3b1826]',
  info: 'bg-[#131825] text-[#2BD4C8] border-[#1f2b3b]'
};

export function StatusPill({ label, tone = 'info' }: StatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs ${toneStyles[tone]}`}>
      {label}
    </span>
  );
}
