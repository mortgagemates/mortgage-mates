import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Plus, LogOut, Building2, ChevronRight,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/broker/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/broker/applications', icon: FileText, label: 'Applications' },
];

export default function BrokerLayout({ children }: { children: ReactNode }) {
  const { currentBroker, logoutBroker } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutBroker();
    navigate('/broker/login');
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide">Mortgage Mates</p>
              <p className="text-xs text-slate-400">Broker Portal</p>
            </div>
          </div>
        </div>

        {/* Broker info */}
        {currentBroker && (
          <div className="px-4 py-4 mx-3 mt-4 bg-slate-800 rounded-xl border border-slate-700">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Broker ID</p>
            <p className="text-xs font-mono text-blue-400 font-semibold">{currentBroker.id}</p>
            <p className="text-sm font-semibold text-white mt-2 truncate">{currentBroker.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentBroker.companyName}</p>
          </div>
        )}

        {/* New Application */}
        <div className="px-3 mt-4">
          <NavLink
            to="/broker/applications/new"
            className="flex items-center gap-2 w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Application
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-blue-400' : ''} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5 border-t border-slate-800 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
