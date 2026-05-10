import type { ApplicationStatus } from '../types';

const CONFIG: Record<ApplicationStatus, { label: string; classes: string }> = {
  draft:      { label: 'Draft',      classes: 'bg-slate-100 text-slate-600' },
  pending:    { label: 'Pending',    classes: 'bg-amber-100 text-amber-700' },
  'in-review':{ label: 'In Review',  classes: 'bg-blue-100 text-blue-700' },
  submitted:  { label: 'Submitted',  classes: 'bg-purple-100 text-purple-700' },
  approved:   { label: 'Approved',   classes: 'bg-emerald-100 text-emerald-700' },
  rejected:   { label: 'Rejected',   classes: 'bg-red-100 text-red-700' },
  completed:  { label: 'Completed',  classes: 'bg-teal-100 text-teal-700' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, classes } = CONFIG[status] ?? CONFIG.draft;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
