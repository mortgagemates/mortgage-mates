import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Save, Send, Copy, Check, FileText,
  PenLine, ChevronDown, Pencil, AlertCircle, CheckCircle,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BrokerLayout from '../../components/BrokerLayout';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { formatDate, formatDateTime } from '../../utils/helpers';
import type { ApplicationStatus } from '../../types';

const STATUSES: ApplicationStatus[] = [
  'draft', 'pending', 'in-review', 'submitted', 'approved', 'rejected', 'completed',
];

const INTAKE_FIELDS = [
  { key: 'applicantName',    label: 'Applicant Full Name',   section: 'Personal' },
  { key: 'applicantPhone',   label: 'Phone Number',          section: 'Personal' },
  { key: 'applicantEmail',   label: 'Email Address',         section: 'Personal' },
  { key: 'propertyAddress',  label: 'Property Address',      section: 'Property' },
  { key: 'propertyType',     label: 'Property Type',         section: 'Property' },
  { key: 'purchasePrice',    label: 'Purchase Price',        section: 'Financial' },
  { key: 'loanAmount',       label: 'Loan Amount',           section: 'Financial' },
  { key: 'downPayment',      label: 'Down Payment',          section: 'Financial' },
  { key: 'loanType',         label: 'Loan Type',             section: 'Financial' },
  { key: 'interestRate',     label: 'Interest Rate',         section: 'Financial' },
  { key: 'loanTerm',         label: 'Loan Term',             section: 'Financial' },
  { key: 'closingDate',      label: 'Expected Closing Date', section: 'Timeline' },
  { key: 'notes',            label: 'Broker Notes',          section: 'Notes' },
];

const SECTION_ORDER = ['Personal', 'Property', 'Financial', 'Timeline', 'Notes'];

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getApplicationById, saveApplication } = useApp();

  const app = getApplicationById(id!);
  const [intake, setIntake] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<ApplicationStatus>('pending');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [requestingSig, setRequestingSig] = useState(false);
  const [tab, setTab] = useState<'extracted' | 'intake'>('extracted');
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  useEffect(() => {
    if (app) {
      setIntake(app.intakeFormData || {});
      setStatus(app.status);
      if (location.state?.justCreated) setJustCreated(true);
    }
  }, [app?.id]);

  if (!app) {
    return (
      <BrokerLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Application not found</p>
            <button onClick={() => navigate('/broker/applications')} className="btn-primary mt-4">
              Back to Applications
            </button>
          </div>
        </div>
      </BrokerLayout>
    );
  }

  const setField = (k: string, v: string) => setIntake(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    const filledCount = INTAKE_FIELDS.filter(f => intake[f.key]?.trim()).length;
    const progress = Math.round(30 + (filledCount / INTAKE_FIELDS.length) * 50 + (status === 'approved' || status === 'completed' ? 20 : 0));
    saveApplication({
      ...app,
      intakeFormData: intake,
      status,
      progress: Math.min(100, progress),
      updatedAt: new Date().toISOString(),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const copyClientUrl = () => {
    navigator.clipboard.writeText(app.uniqueUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requestSignature = async () => {
    setRequestingSig(true);
    await new Promise(r => setTimeout(r, 1000));
    saveApplication({ ...app, signatureStatus: 'pending', updatedAt: new Date().toISOString() });
    setRequestingSig(false);
  };

  const extracted = app.extractedData || {};
  const sections = SECTION_ORDER.map(sec => ({
    name: sec,
    fields: INTAKE_FIELDS.filter(f => f.section === sec),
  }));

  return (
    <BrokerLayout>
      <div className="p-8">
        <button
          onClick={() => navigate('/broker/applications')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Applications
        </button>

        {justCreated && (
          <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Application created successfully!</p>
              <p className="text-xs text-emerald-600 mt-0.5">
                PDF data has been extracted. Review the extracted fields below and complete the intake form.
              </p>
            </div>
            <button onClick={() => setJustCreated(false)} className="text-emerald-400 hover:text-emerald-600 ml-auto">✕</button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{app.applicationName}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{app.id}</span>
              <StatusBadge status={app.status} />
              <span className="text-xs text-slate-400">Created {formatDate(app.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {saved && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                <CheckCircle size={15} /> Saved
              </span>
            )}
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              <Save size={15} />
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left — main content */}
          <div className="col-span-2 space-y-6">
            {/* Progress */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700">Application Progress</p>
                <span className="text-sm font-bold text-blue-600">{app.progress}%</span>
              </div>
              <ProgressBar value={app.progress} showLabel={false} />
            </div>

            {/* Tabs */}
            <div className="card overflow-hidden">
              <div className="flex border-b border-slate-100">
                {(['extracted', 'intake'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 py-3.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                      tab === t
                        ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50/50'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'extracted' ? <><FileText size={15} /> Extracted Data</> : <><Pencil size={15} /> Intake Form</>}
                  </button>
                ))}
              </div>

              {/* Extracted Data */}
              {tab === 'extracted' && (
                <div className="p-6">
                  {Object.keys(extracted).length === 0 ? (
                    <div className="text-center py-10">
                      <FileText size={32} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No extracted data — upload PDFs to extract fields</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                        <CheckCircle size={15} className="text-blue-500 shrink-0" />
                        <p className="text-xs text-blue-700 font-medium">
                          {Object.keys(extracted).length} fields extracted from your PDFs. Review and correct any values below.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {Object.entries(extracted).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs font-medium text-slate-400 capitalize mb-0.5">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-sm font-medium text-slate-800">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Intake Form */}
              {tab === 'intake' && (
                <div className="p-6 space-y-6">
                  {sections.map(({ name, fields }) => (
                    <div key={name}>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 pb-2 border-b border-slate-100">
                        {name}
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        {fields.map(f => (
                          <div key={f.key} className={f.key === 'notes' ? 'col-span-2' : ''}>
                            <label className="label">{f.label}</label>
                            {f.key === 'notes' ? (
                              <textarea
                                className="input resize-none"
                                rows={3}
                                placeholder={`Enter ${f.label.toLowerCase()}…`}
                                value={intake[f.key] || (extracted[f.key] ?? '')}
                                onChange={e => setField(f.key, e.target.value)}
                              />
                            ) : (
                              <input
                                className="input"
                                placeholder={extracted[f.key] ? `Extracted: ${extracted[f.key]}` : `Enter ${f.label.toLowerCase()}…`}
                                value={intake[f.key] || (extracted[f.key] ?? '')}
                                onChange={e => setField(f.key, e.target.value)}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Client info */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Client</p>
              <p className="font-semibold text-slate-900">{app.clientName}</p>
              <p className="text-sm text-slate-500 mt-0.5">{app.clientEmail}</p>
            </div>

            {/* Status */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Application Status</p>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDrop(v => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                >
                  <StatusBadge status={status} />
                  <ChevronDown size={15} className="text-slate-400" />
                </button>
                {showStatusDrop && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1">
                    {STATUSES.map(s => (
                      <button
                        key={s}
                        onClick={() => { setStatus(s); setShowStatusDrop(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left text-sm"
                      >
                        <StatusBadge status={s} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Documents</p>
              {app.commitmentLetterName ? (
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="truncate">{app.commitmentLetterName}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-2">No commitment letter</p>
              )}
              {app.creditApplicationName ? (
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <CheckCircle size={13} className="text-emerald-500" />
                  <span className="truncate">{app.creditApplicationName}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No credit application</p>
              )}
            </div>

            {/* Client URL */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Client Access URL</p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-xs text-slate-500 break-all mb-3">
                {app.uniqueUrl}
              </div>
              <button onClick={copyClientUrl} className={`btn-secondary w-full text-xs ${copied ? '!text-emerald-600 !border-emerald-200 !bg-emerald-50' : ''}`}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy Client URL</>}
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">Share this URL with your client offline</p>
            </div>

            {/* Signature */}
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Client Signature</p>
              {app.signatureStatus === 'signed' ? (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle size={15} />
                  Signed {app.signedAt ? formatDateTime(app.signedAt) : ''}
                </div>
              ) : app.signatureStatus === 'pending' ? (
                <div className="flex items-center gap-2 text-amber-600 text-sm font-medium">
                  <PenLine size={15} />
                  Awaiting client signature
                </div>
              ) : (
                <button
                  onClick={requestSignature}
                  disabled={requestingSig}
                  className="btn-primary w-full text-xs"
                >
                  <Send size={13} />
                  {requestingSig ? 'Requesting…' : 'Request Signature'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </BrokerLayout>
  );
}
