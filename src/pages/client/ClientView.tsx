import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Building2, CheckCircle, Clock, XCircle, PenLine, FileText, AlertCircle } from 'lucide-react';
import * as storage from '../../utils/storage';
import { formatDate, formatDateTime } from '../../utils/helpers';
import type { Application, ApplicationStatus } from '../../types';

const STATUS_INFO: Record<ApplicationStatus, { icon: React.ElementType; color: string; bg: string; title: string; desc: string }> = {
  draft:      { icon: Clock,        color: 'text-slate-500',   bg: 'bg-slate-100',   title: 'Draft',       desc: 'Your application is being prepared by your broker.' },
  pending:    { icon: Clock,        color: 'text-amber-600',   bg: 'bg-amber-100',   title: 'Pending',     desc: 'Your application has been submitted and is awaiting review.' },
  'in-review':{ icon: FileText,     color: 'text-blue-600',    bg: 'bg-blue-100',    title: 'In Review',   desc: 'Your application is currently being reviewed by the lender.' },
  submitted:  { icon: FileText,     color: 'text-purple-600',  bg: 'bg-purple-100',  title: 'Submitted',   desc: 'Your application has been formally submitted to the lender.' },
  approved:   { icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-100', title: 'Approved',    desc: 'Congratulations! Your mortgage application has been approved.' },
  rejected:   { icon: XCircle,      color: 'text-red-600',     bg: 'bg-red-100',     title: 'Rejected',    desc: 'Unfortunately your application was not approved at this time. Please contact your broker.' },
  completed:  { icon: CheckCircle,  color: 'text-teal-600',    bg: 'bg-teal-100',    title: 'Completed',   desc: 'Your mortgage application is complete. Well done!' },
};

export default function ClientView() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const [app, setApp] = useState<Application | null | undefined>(undefined);
  const [showSign, setShowSign] = useState(false);
  const [sigName, setSigName] = useState('');
  const [sigDrawn, setSigDrawn] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signDone, setSignDone] = useState(false);

  useEffect(() => {
    const found = storage.getApplicationById(applicationId!);
    setApp(found ?? null);
  }, [applicationId]);

  const handleSign = async () => {
    if (!sigName.trim() || !sigDrawn) return;
    setSigning(true);
    await new Promise(r => setTimeout(r, 1500));
    if (app) {
      const updated: Application = {
        ...app,
        signatureStatus: 'signed',
        signedAt: new Date().toISOString(),
        clientSignature: sigName,
        status: app.status === 'in-review' ? 'submitted' : app.status,
        progress: Math.min(100, (app.progress || 0) + 20),
        updatedAt: new Date().toISOString(),
      };
      storage.saveApplication(updated);
      setApp(updated);
    }
    setSigning(false);
    setSignDone(true);
    setShowSign(false);
  };

  if (app === undefined) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (app === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-white text-xl font-bold mb-2">Application Not Found</h1>
          <p className="text-slate-400 text-sm max-w-sm">
            The application link may be incorrect or has been removed. Please contact your broker.
          </p>
        </div>
      </div>
    );
  }

  const info = STATUS_INFO[app.status] ?? STATUS_INFO.pending;
  const StatusIcon = info.icon;

  const steps = [
    { label: 'Application Created', done: true, date: formatDate(app.createdAt) },
    { label: 'Documents Uploaded', done: !!(app.commitmentLetterName && app.creditApplicationName) },
    { label: 'Under Review', done: ['in-review','submitted','approved','completed'].includes(app.status) },
    { label: 'Decision Made', done: ['approved','rejected','completed'].includes(app.status) },
    { label: 'Signed & Complete', done: app.signatureStatus === 'signed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <header className="px-6 py-5 border-b border-white/10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Mortgage Mates</p>
            <p className="text-blue-300 text-xs">Client Application Portal</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Sign done banner */}
        {signDone && (
          <div className="mb-6 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl p-4">
            <CheckCircle size={20} className="text-emerald-400" />
            <div>
              <p className="text-emerald-300 font-semibold text-sm">Documents signed successfully!</p>
              <p className="text-emerald-400/70 text-xs mt-0.5">Your signature has been recorded. Your broker will be notified.</p>
            </div>
          </div>
        )}

        {/* Application card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1.5">Application</p>
              <h1 className="text-2xl font-bold text-white">{app.applicationName}</h1>
              <p className="text-sm font-mono text-blue-400 mt-1">{app.id}</p>
            </div>
            <div className={`w-14 h-14 rounded-2xl ${info.bg} flex items-center justify-center`}>
              <StatusIcon size={28} className={info.color} />
            </div>
          </div>

          <div className={`${info.bg} rounded-xl px-4 py-3 mb-6`}>
            <p className={`text-sm font-semibold ${info.color} mb-0.5`}>{info.title}</p>
            <p className={`text-xs ${info.color} opacity-80`}>{info.desc}</p>
          </div>

          {/* Client info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-xs text-slate-500 mb-1">Client Name</p>
              <p className="text-sm font-medium text-white">{app.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Created</p>
              <p className="text-sm font-medium text-white">{formatDate(app.createdAt)}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-slate-400 font-medium">Progress</p>
              <p className="text-xs font-bold text-blue-400">{app.progress}%</p>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${app.progress}%` }}
              />
            </div>
          </div>

          {/* Signature section */}
          {app.signatureStatus === 'pending' && !signDone && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <PenLine size={16} className="text-amber-400" />
                <p className="text-amber-300 font-semibold text-sm">Signature Required</p>
              </div>
              <p className="text-xs text-amber-400/80 mb-3">
                Your broker has requested you to sign the mortgage documents to proceed.
              </p>
              <button onClick={() => setShowSign(true)} className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold rounded-xl transition-colors">
                Sign Documents
              </button>
            </div>
          )}

          {app.signatureStatus === 'signed' && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-6">
              <CheckCircle size={16} className="text-emerald-400" />
              <div>
                <p className="text-emerald-300 text-sm font-semibold">Documents Signed</p>
                {app.signedAt && <p className="text-xs text-emerald-400/70">{formatDateTime(app.signedAt)}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-5">Application Timeline</p>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.label} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-transparent border-slate-600'
                  }`}>
                    {step.done && <CheckCircle size={13} className="text-white" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-0.5 h-8 mt-1 ${step.done ? 'bg-blue-500/40' : 'bg-slate-700'}`} />
                  )}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium mt-0.5 ${step.done ? 'text-white' : 'text-slate-500'}`}>
                    {step.label}
                  </p>
                  {step.date && <p className="text-xs text-slate-500 mt-0.5">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-8">
          Questions? Contact your broker directly. · Mortgage Mates © 2024
        </p>
      </div>

      {/* Signing modal */}
      {showSign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowSign(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Sign Documents</h3>
            <p className="text-sm text-slate-500 mb-6">
              By signing below, you confirm that all information is accurate and you agree to the mortgage terms.
            </p>

            <div className="mb-4">
              <label className="label">Full Legal Name</label>
              <input
                className="input"
                placeholder="Type your full name"
                value={sigName}
                onChange={e => setSigName(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="label">Signature</label>
              <div
                onClick={() => setSigDrawn(true)}
                className={`h-28 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  sigDrawn ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {sigDrawn ? (
                  <p className="text-blue-700 font-bold text-xl italic" style={{ fontFamily: 'cursive' }}>
                    {sigName || 'Signed'}
                  </p>
                ) : (
                  <p className="text-slate-400 text-sm">Click to add signature</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowSign(false)} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={handleSign}
                disabled={!sigName.trim() || !sigDrawn || signing}
                className="btn-primary flex-1"
              >
                {signing ? 'Signing…' : 'Confirm & Sign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
