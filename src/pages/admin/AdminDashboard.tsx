import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, CheckCircle, TrendingUp, ArrowRight, Building2, Clock,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import AdminLayout from '../../components/AdminLayout';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/helpers';
import type { Broker } from '../../types';

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: number | string; color: string; sub?: string;
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { getBrokers, getAllApplications } = useApp();

  const brokers = getBrokers();
  const apps = getAllApplications();

  const activeBrokers = brokers.filter(b => b.paymentCompleted && b.emailVerified).length;
  const totalApps = apps.length;
  const approvedApps = apps.filter(a => a.status === 'approved' || a.status === 'completed').length;
  const pendingApps = apps.filter(a => a.status === 'pending' || a.status === 'in-review').length;

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">Platform overview and broker management</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users}       label="Total Brokers"     value={brokers.length}    color="bg-violet-500"  sub="Registered" />
          <StatCard icon={Building2}   label="Active Brokers"    value={activeBrokers}     color="bg-blue-500"    sub="Subscribed" />
          <StatCard icon={FileText}    label="Total Applications" value={totalApps}         color="bg-amber-500"   sub="All brokers" />
          <StatCard icon={CheckCircle} label="Approved"          value={approvedApps}       color="bg-emerald-500" sub="Successfully closed" />
        </div>

        {/* Brokers table */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Registered Brokers</h2>
            <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full font-medium">
              {brokers.length} total
            </span>
          </div>

          {brokers.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No brokers registered yet</p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <div className="col-span-3">Broker</div>
                <div className="col-span-2">Broker ID</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-2">Subscription</div>
                <div className="col-span-1">Apps</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1"></div>
              </div>

              <div className="divide-y divide-slate-50">
                {brokers.map((broker: Broker) => {
                  const brokerApps = apps.filter(a => a.brokerId === broker.id);
                  const isActive = broker.paymentCompleted && broker.emailVerified;
                  const subExpired = broker.subscriptionEnd && new Date(broker.subscriptionEnd) < new Date();

                  return (
                    <div
                      key={broker.id}
                      onClick={() => navigate(`/admin/brokers/${broker.id}`)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors items-center"
                    >
                      <div className="col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 text-violet-600 font-bold text-sm">
                            {broker.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">{broker.name}</p>
                            <p className="text-xs text-slate-400 truncate">{broker.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-mono text-violet-600 font-semibold">{broker.id}</p>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm text-slate-600 truncate">{broker.companyName}</p>
                      </div>
                      <div className="col-span-2">
                        {broker.subscriptionStart ? (
                          <div>
                            <p className="text-xs text-slate-600">
                              {formatDate(broker.subscriptionStart)} →
                            </p>
                            <p className={`text-xs font-medium ${subExpired ? 'text-red-500' : 'text-slate-500'}`}>
                              {broker.subscriptionEnd ? formatDate(broker.subscriptionEnd) : 'N/A'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Not subscribed</p>
                        )}
                      </div>
                      <div className="col-span-1">
                        <span className="text-sm font-bold text-slate-900">{brokerApps.length}</span>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          isActive
                            ? subExpired ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isActive ? (subExpired ? 'Expired' : 'Active') : 'Inactive'}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <ArrowRight size={15} className="text-slate-300" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
