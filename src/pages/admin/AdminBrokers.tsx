import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import AdminLayout from '../../components/AdminLayout';
import { formatDate } from '../../utils/helpers';

export default function AdminBrokers() {
  const navigate = useNavigate();
  const { getBrokers, getAllApplications } = useApp();
  const [search, setSearch] = useState('');

  const brokers = getBrokers();
  const apps = getAllApplications();

  const filtered = brokers.filter(b =>
    search.trim() === '' ||
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.email.toLowerCase().includes(search.toLowerCase()) ||
    b.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Brokers</h1>
            <p className="text-slate-500 text-sm mt-0.5">{brokers.length} registered brokers</p>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search by name, ID, email or company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No brokers found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <div className="col-span-4">Broker</div>
                <div className="col-span-2">Broker ID</div>
                <div className="col-span-2">Company</div>
                <div className="col-span-1">Apps</div>
                <div className="col-span-2">Registered</div>
                <div className="col-span-1"></div>
              </div>
              <div className="divide-y divide-slate-50">
                {filtered.map(broker => {
                  const brokerApps = apps.filter(a => a.brokerId === broker.id);
                  const isActive = broker.paymentCompleted && broker.emailVerified;
                  return (
                    <div
                      key={broker.id}
                      onClick={() => navigate(`/admin/brokers/${broker.id}`)}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm shrink-0">
                          {broker.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{broker.name}</p>
                          <p className="text-xs text-slate-400 truncate">{broker.email}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-mono text-violet-600 font-semibold">{broker.id}</p>
                      </div>
                      <div className="col-span-2 min-w-0">
                        <p className="text-sm text-slate-600 truncate">{broker.companyName}</p>
                      </div>
                      <div className="col-span-1">
                        <span className="text-sm font-bold text-slate-900">{brokerApps.length}</span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500">{formatDate(broker.createdAt)}</p>
                        <span className={`text-xs font-medium ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {isActive ? 'Active' : 'Inactive'}
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
