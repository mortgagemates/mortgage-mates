import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, ArrowRight, Filter } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BrokerLayout from '../../components/BrokerLayout';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { formatDate } from '../../utils/helpers';
import type { ApplicationStatus } from '../../types';

const STATUS_FILTERS: { label: string; value: ApplicationStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Pending', value: 'pending' },
  { label: 'In Review', value: 'in-review' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Completed', value: 'completed' },
];

export default function ApplicationsList() {
  const navigate = useNavigate();
  const { currentBroker, getApplicationsByBroker } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all');

  if (!currentBroker) return null;

  const apps = getApplicationsByBroker(currentBroker.id);

  const filtered = apps.filter(a => {
    const matchSearch =
      search.trim() === '' ||
      a.applicationName.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.clientEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <BrokerLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
            <p className="text-slate-500 text-sm mt-0.5">{apps.length} total application{apps.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => navigate('/broker/applications/new')} className="btn-primary">
            <Plus size={16} /> New Application
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9"
                placeholder="Search by name, ID or client email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter size={15} className="text-slate-400 shrink-0" />
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    statusFilter === f.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">
                {apps.length === 0 ? 'No applications yet' : 'No results found'}
              </p>
              {apps.length === 0 && (
                <button onClick={() => navigate('/broker/applications/new')} className="btn-primary mt-4">
                  <Plus size={16} /> Create First Application
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <div className="col-span-4">Application</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1">Created</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-50">
                {filtered.map(app => (
                  <div
                    key={app.id}
                    onClick={() => navigate(`/broker/applications/${app.id}`)}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors items-center"
                  >
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{app.applicationName}</p>
                          <p className="text-xs font-mono text-slate-400">{app.id}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{app.clientName}</p>
                      <p className="text-xs text-slate-400 truncate">{app.clientEmail}</p>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="col-span-2">
                      <ProgressBar value={app.progress} />
                    </div>
                    <div className="col-span-1">
                      <p className="text-xs text-slate-400">{formatDate(app.createdAt)}</p>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <ArrowRight size={15} className="text-slate-300" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="mt-3 text-xs text-slate-400 text-right">
            Showing {filtered.length} of {apps.length} applications
          </p>
        )}
      </div>
    </BrokerLayout>
  );
}
