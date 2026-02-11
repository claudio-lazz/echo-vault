import type { ReactNode } from 'react';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, actions, children }: SectionCardProps) {
  return (
    <div className="rounded-2xl border border-[#2A3040] bg-[#171B24] p-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-base font-semibold text-white">{title}</div>
          {subtitle && <div className="text-xs text-[#9AA4B2]">{subtitle}</div>}
        </div>
        {actions}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
