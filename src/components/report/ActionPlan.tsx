import { ActionItem } from '@/types/report';
import { Clock, Calendar } from 'lucide-react';

interface ActionPlanProps {
  items: ActionItem[];
}

const PRIORITY_COLORS = [
  'bg-red-500',
  'bg-red-400',
  'bg-yellow-500',
  'bg-yellow-400',
  'bg-blue-500',
  'bg-blue-400',
  'bg-green-500',
  'bg-green-400',
];

function getPriorityColor(priority: number): string {
  return PRIORITY_COLORS[Math.min(priority - 1, PRIORITY_COLORS.length - 1)] || 'bg-gray-500';
}

export function ActionPlan({ items }: ActionPlanProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-6 shadow-sm md:p-8">
      <h2 className="font-serif text-xl tracking-tight text-text-primary md:text-2xl">
        Prioriteret Handlingsplan
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Følg disse trin i rækkefølge for at bringe din virksomhed i compliance.
      </p>

      {/* Desktop table */}
      <div className="mt-6 hidden md:block">
        <div className="overflow-hidden rounded-xl border border-surface-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-deep-blue text-left text-white">
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Handling</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Tidsforbrug</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.priority}
                  className={i % 2 === 0 ? 'bg-gray-50/60' : 'bg-white'}
                >
                  <td className="px-4 py-3">
                    <div className={`flex size-7 items-center justify-center rounded-full text-xs font-bold text-white ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {item.deadlineRecommendation}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {item.estimatedTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile stacked cards */}
      <div className="mt-6 space-y-3 md:hidden">
        {items.map((item) => (
          <div
            key={item.priority}
            className="flex gap-3 rounded-xl border border-surface-border bg-white p-4"
          >
            <div className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${getPriorityColor(item.priority)}`}>
              {item.priority}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-text-primary">{item.title}</h4>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {item.deadlineRecommendation}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {item.estimatedTime}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
