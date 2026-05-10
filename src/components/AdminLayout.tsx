import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import type { ReactNode } from 'react';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/brokers', icon: Users, label: 'Brokers' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { logoutAdmin } = useApp();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="w-64 flex flex-col bg-slate-900 border-r border-slate-800">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Mortgage Mates</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 mx-3 mt-4 bg-violet-900/40 rounded-xl border border-violet-700/30">
          <p className="text-xs text-violet-300 font-medium">Signed in as</p>
          <p className="text-sm font-semibold text-white mt-0.5">Admin User</p>
          <p className="text-xs text-slate-400">admin@mortgagemates.com</p>
        </div>

        <nav className="flex-1 px-3 mt-6 space-y-1">
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
                  <Icon size={18} className={isActive ? 'text-violet-400' : ''} />
                  {label}
                  {isActive && <ChevronRight size={14} className="ml-auto text-violet-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-slate-800 pt-4">
          <button
            onClick={() => { logoutAdmin(); navigate('/admin'); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
