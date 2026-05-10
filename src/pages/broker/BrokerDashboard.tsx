import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  FileText, CheckCircle, Clock, XCircle, TrendingUp,
  Plus, ArrowRight, Bell, Copy, Check,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import BrokerLayout from '../../components/BrokerLayout';
import StatusBadge from '../../components/StatusBadge';
import ProgressBar from '../../components/ProgressBar';
import { formatDate } from '../../utils/helpers';
import type { Application, ApplicationStatus } from '../../types';

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: number; color: string; sub?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function BrokerDashboard() {
  const { currentBroker, getApplicationsByBroker } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showWelcome, setShowWelcome] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (location.state?.welcome) setShowWelcome(true);
  }, []);

  if (!currentBroker) return null;

  const apps = getApplicationsByBroker(currentBroker.id);

  const count = (s: ApplicationStatus) => apps.filter(a => a.status === s).length;
  const total = apps.length;
  const completed = count('completed') + count('approved');
  const pending = count('pending') + count('draft');
  const inReview = count('in-review') + count('submitted');
  const rejected = count('rejected');

  const recent = [...apps]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const copyUrl = () => {
    navigator.clipboard.writeText(currentBroker.uniqueUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BrokerLayout>
      <div className="p-8">
        {/* Welcome banner */}
        {showWelcome && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white flex items-center justify-between">
            <div>
              <p className="font-bold text-lg mb-1">🎉 Welcome to Mortgage Mates, {currentBroker.name}!</p>
              <p className="text-blue-100 text-sm">Your account is active. Your unique broker ID and portal URL have been sent to {currentBroker.email}.</p>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-white/70 hover:text-white text-xl font-light ml-4">✕</button>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Good to see you, {currentBroker.name.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={18} />
              {inReview > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
              )}
            </button>
            <button onClick={() => navigate('/broker/applications/new')} className="btn-primary">
              <Plus size={16} /> New Application
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText}     label="Total Applications" value={total}     color="bg-blue-500"    sub="All time" />
          <StatCard icon={CheckCircle}  label="Completed"          value={completed}  color="bg-emerald-500" sub="Approved & done" />
          <StatCard icon={Clock}        label="In Progress"        value={pending + inReview} color="bg-amber-500" sub="Pending & review" />
          <StatCard icon={TrendingUp}   label="Success Rate"       value={total > 0 ? Math.round((completed / total) * 100) : 0} color="bg-violet-500" sub="Completion %" />
        </div>

        {/* Broker URL card */}
        <div className="card p-5 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Your Unique Broker Portal</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 font-mono text-xs text-slate-600 truncate">
              {currentBroker.uniqueUrl}
            </div>
            <button onClick={copyUrl} className={`btn-secondary shrink-0 ${copied ? '!text-emerald-600 !border-emerald-200 !bg-emerald-50' : ''}`}>
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy URL</>}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2">Share this URL with clients to access their applications</p>
        </div>

        {/* Recent Applications */}
        <div className="card">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent Applications</h2>
            <button
              onClick={() => navigate('/broker/applications')}
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 font-medium"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recent.length === 0 ? (
            <div className="py-16 text-center">
              <FileText size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No applications yet</p>
              <p className="text-slate-400 text-sm mb-4">Create your first application to get started</p>
              <button onClick={() => navigate('/broker/applications/new')} className="btn-primary">
                <Plus size={16} /> New Application
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((app: Application) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/broker/applications/${app.id}`)}
                  className="px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors flex items-center gap-4"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{app.applicationName}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{app.id}</p>
                  </div>
                  <div className="hidden sm:block w-32">
                    <ProgressBar value={app.progress} />
                  </div>
                  <StatusBadge status={app.status} />
                  <p className="text-xs text-slate-400 hidden md:block shrink-0">{formatDate(app.createdAt)}</p>
                  <ArrowRight size={15} className="text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription info */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Subscription</p>
            <p className="text-sm font-semibold text-emerald-600">Active — Standard Plan</p>
            <p className="text-xs text-slate-400 mt-1">
              Renews: {currentBroker.subscriptionEnd ? formatDate(currentBroker.subscriptionEnd) : 'N/A'}
            </p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Broker ID</p>
            <p className="text-sm font-mono font-bold text-blue-600">{currentBroker.id}</p>
            <p className="text-xs text-slate-400 mt-1">Registered: {formatDate(currentBroker.createdAt)}</p>
          </div>
        </div>
      </div>
    </BrokerLayout>
  );
}
