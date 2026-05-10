import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, FileText, ArrowRight, ChevronDown, Save, CheckCircle, Phone, Mail, MapPin,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { formatDate } from '../../utils/helpers';
import type { ApplicationStatus } from '../../types';

const STATUSES: ApplicationStatus[] = [
  'draft', 'pending', 'in-review', 'submitted', 'approved', 'rejected', 'completed',
];

export default function BrokerDetail() {
  const { brokerId } = useParams<{ brokerId: string }>();
  const navigate = useNavigate();
  const { getBrokerById, getApplicationsByBroker, saveApplication, getApplicationById } = useApp();

  const broker = getBrokerById(brokerId!);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  if (!broker) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">Broker not found.</p>
        </div>
      </AdminLayout>
    );
  }

  const apps = getApplicationsByBroker(broker.id);

  const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
    setOpenDrop(null);
    setSaving(appId);
    await new Promise(r => setTimeout(r, 500));
    const app = getApplicationById(appId);
    if (app) {
      const progress =
        status === 'approved' || status === 'completed' ? 100 :
        status === 'submitted' ? 80 :
        status === 'in-review' ? 60 :
        status === 'pending' ? 30 :
        status === 'rejected' ? app.progress :
        app.progress;
      saveApplication({ ...app, status, progress, updatedAt: new Date().toISOString() });
    }
    setSaving(null);
    setSavedId(appId);
    setTimeout(() => setSavedId(null), 2000);
  };

  const isActive = broker.paymentCompleted && broker.emailVerified;
  const subExpired = broker.subscriptionEnd && new Date(broker.subscriptionEnd) < new Date();

  return (
    <AdminLayout>
      <div className="p-8">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Broker header */}
        <div className="card p-6 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center text-2xl font-bold text-violet-600 shrink-0">
              {broker.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{broker.name}</h1>
                  <p className="text-slate-500">{broker.companyName}</p>
                  <p className="text-xs font-mono text-violet-600 font-semibold mt-1">{broker.id}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isActive
                    ? subExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {isActive ? (subExpired ? 'Subscription Expired' : 'Active Subscriber') : 'Inactive'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{broker.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  {broker.phoneNumber}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{broker.officeAddress}, {broker.postalCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription details */}
          <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Email Verified', value: broker.emailVerified ? 'Yes' : 'No', ok: broker.emailVerified },
              { label: 'Payment', value: broker.paymentCompleted ? 'Completed' : 'Pending', ok: broker.paymentCompleted },
              { label: 'Sub Start', value: broker.subscriptionStart ? formatDate(broker.subscriptionStart) : '—', ok: true },
              { label: 'Sub End', value: broker.subscriptionEnd ? formatDate(broker.subscriptionEnd) : '—', ok: !subExpired },
            ].map(({ label, value, ok }) => (
              <div key={label}>
                <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                <p className={`text-sm font-semibold ${ok ? 'text-emerald-600' : 'text-red-500'}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Applications */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Applications</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              {apps.length} total
            </span>
          </div>

          {apps.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No applications under this broker</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <div className="col-span-4">Application</div>
                <div className="col-span-2">Client</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-3">Status (Admin Control)</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-slate-50">
                {apps.map(app => (
                  <div key={app.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{app.applicationName}</p>
                          <p className="text-xs font-mono text-slate-400">{app.id}</p>
                          <p className="text-xs text-slate-400">{formatDate(app.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{app.clientName}</p>
                      <p className="text-xs text-slate-400 truncate">{app.clientEmail}</p>
                    </div>
                    <div className="col-span-2">
                      <ProgressBar value={app.progress} />
                    </div>
                    <div className="col-span-3 relative">
                      {savedId === app.id ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                          <CheckCircle size={14} /> Status updated
                        </div>
                      ) : saving === app.id ? (
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <span className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin" />
                          Saving…
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            onClick={() => setOpenDrop(openDrop === app.id ? null : app.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-slate-100 transition-colors w-full"
                          >
                            <StatusBadge status={app.status} />
                            <ChevronDown size={14} className="text-slate-400 ml-auto shrink-0" />
                          </button>
                          {openDrop === app.id && (
                            <div className="absolute z-20 top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[160px]">
                              {STATUSES.map(s => (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(app.id, s)}
                                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"
                                >
                                  <StatusBadge status={s} />
                                  {s === app.status && <CheckCircle size={12} className="text-blue-500 ml-auto" />}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button
                        onClick={() => navigate(`/broker/applications/${app.id}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                        title="View application"
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
