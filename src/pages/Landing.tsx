import { useNavigate } from 'react-router-dom';
import { Building2, Users, Shield, ArrowRight, FileSearch, CheckCircle } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Building2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg tracking-tight">Mortgage Mates</p>
            <p className="text-blue-300 text-xs">B2B PDF Extractor Platform</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
        >
          <Shield size={15} />
          Admin Access
        </button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-xs font-medium mb-6">
          <FileSearch size={13} />
          Intelligent Mortgage Document Processing
        </div>
        <h1 className="text-5xl font-bold text-white mb-4 tracking-tight leading-tight max-w-2xl">
          Streamline Your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Mortgage Workflow
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mb-10">
          Extract, review, and manage mortgage applications effortlessly.
          Purpose-built for brokers who value speed and accuracy.
        </p>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          <button
            onClick={() => navigate('/broker/login')}
            className="group flex flex-col items-start p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 group-hover:bg-blue-500/30 transition-colors">
              <Building2 size={20} className="text-blue-400" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">Broker Portal</p>
            <p className="text-slate-400 text-xs mb-3">Manage applications and clients</p>
            <span className="flex items-center gap-1 text-blue-400 text-xs font-medium group-hover:gap-2 transition-all">
              Sign In <ArrowRight size={13} />
            </span>
          </button>

          <button
            onClick={() => navigate('/broker/signup')}
            className="group flex flex-col items-start p-6 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-400/50 rounded-2xl text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center mb-3 group-hover:bg-blue-500/40 transition-colors">
              <Users size={20} className="text-blue-300" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">New Broker?</p>
            <p className="text-slate-400 text-xs mb-3">Create your broker account</p>
            <span className="flex items-center gap-1 text-blue-300 text-xs font-medium group-hover:gap-2 transition-all">
              Get Started <ArrowRight size={13} />
            </span>
          </button>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
          {[
            { label: 'PDF Extraction', desc: 'Auto-extract key fields' },
            { label: 'Client Portal', desc: 'Seamless document signing' },
            { label: 'Secure & Compliant', desc: 'Bank-grade encryption' },
          ].map(({ label, desc }) => (
            <div key={label} className="text-center">
              <CheckCircle size={18} className="text-blue-400 mx-auto mb-2" />
              <p className="text-white text-xs font-semibold">{label}</p>
              <p className="text-slate-500 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-slate-600 text-xs">
        © 2024 Mortgage Mates. All rights reserved.
      </footer>
    </div>
  );
}
