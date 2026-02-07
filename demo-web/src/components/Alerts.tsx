import { useMemo, useState } from 'react';
import { mockAlerts } from '../lib/mockData';
import { SectionCard } from './SectionCard';
import { StatusPill } from './StatusPill';

const severityOptions = ['all', 'danger', 'warning', 'info'] as const;

type SeverityFilter = (typeof severityOptions)[number];

export function Alerts() {
  const [query, setQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

  const filtered = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return mockAlerts.filter((alert) => {
      const matchesQuery = lowered
        ? [alert.title, alert.id].some((field) => field.toLowerCase().includes(lowered))
        : true;
      const matchesSeverity = severityFilter === 'all' ? true : alert.severity === severityFilter;
      return matchesQuery && matchesSeverity;
    });
  }, [query, severityFilter]);

  const counts = severityOptions.reduce<Record<string, number>>((acc, option) => {
    if (option !== 'all') {
      acc[option] = mockAlerts.filter((alert) => alert.severity === option).length;
    }
    return acc;
  }, {});

  return (
    <section className="space-y-6 px-8 py-6">
      <SectionCard title="Alerts" subtitle="Security & grant lifecycle">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9AA4B2]">
            <span>Danger: <span className="text-white">{counts.danger ?? 0}</span></span>
            <span>Warning: <span className="text-white">{counts.warning ?? 0}</span></span>
            <span>Info: <span className="text-white">{counts.info ?? 0}</span></span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search alerts"
              className="w-52 rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white placeholder:text-[#6E7683]"
            />
            <select
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as SeverityFilter)}
              className="rounded-lg border border-[#2A3040] bg-[#0f1219] px-3 py-2 text-xs text-white"
            >
              {severityOptions.map((option) => (
                <option key={option} value={option}>
                  {option === 'all' ? 'All severities' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3 text-sm">
          {filtered.map((alert) => (
            <div key={alert.id} className="rounded-xl border border-[#2A3040] bg-[#11141c] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{alert.title}</div>
                  <div className="text-xs text-[#9AA4B2]">{alert.id} · {alert.time}</div>
                </div>
                <StatusPill label={alert.severity} tone={alert.severity as any} />
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2A3040] bg-[#0f1219] px-4 py-6 text-center text-xs text-[#9AA4B2]">
              No alerts match this filter.
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  );
}
