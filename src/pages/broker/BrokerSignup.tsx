import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Check } from 'lucide-react';
import * as storage from '../../utils/storage';

const STEPS = ['Your Details', 'Verify Email', 'Payment'];

export default function BrokerSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', companyName: '', officeAddress: '', postalCode: '',
    phoneNumber: '', email: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Store partial broker after step 1
  const [draftId, setDraftId] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const validateStep0 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.companyName.trim()) e.companyName = 'Required';
    if (!form.officeAddress.trim()) e.officeAddress = 'Required';
    if (!form.postalCode.trim()) e.postalCode = 'Required';
    if (!/^\+?[\d\s\-()]{7,}$/.test(form.phoneNumber)) e.phoneNumber = 'Invalid phone number';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';
    if (storage.getBrokerByEmail(form.email)) e.email = 'Email already registered';
    if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitStep0 = async () => {
    if (!validateStep0()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    // Create broker with emailVerified: false
    const { generateBrokerId, generateApplicationUrl } = await import('../../utils/helpers');
    const id = generateBrokerId();
    const now = new Date().toISOString();
    const broker = {
      id,
      name: form.name,
      companyName: form.companyName,
      officeAddress: form.officeAddress,
      postalCode: form.postalCode,
      phoneNumber: form.phoneNumber,
      email: form.email,
      password: form.password,
      emailVerified: false,
      paymentCompleted: false,
      subscriptionStart: '',
      subscriptionEnd: '',
      uniqueUrl: `${window.location.origin}/broker-portal/${id}`,
      createdAt: now,
    };
    storage.saveBroker(broker);
    setDraftId(id);
    setLoading(false);
    setStep(1);
  };

  const verifyEmail = async () => {
    if (!draftId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const broker = storage.getBrokerById(draftId)!;
    storage.saveBroker({ ...broker, emailVerified: true });
    setLoading(false);
    setStep(2);
  };

  const completePayment = async () => {
    if (!draftId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const broker = storage.getBrokerById(draftId)!;
    const now = new Date().toISOString();
    const end = new Date(Date.now() + 365 * 86400000).toISOString();
    storage.saveBroker({ ...broker, paymentCompleted: true, subscriptionStart: now, subscriptionEnd: end });
    // Auto login
    storage.setCurrentBroker(draftId);
    setLoading(false);
    navigate('/broker/dashboard', { state: { welcome: true } });
  };

  const field = (key: keyof typeof form, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className={`input ${errors[key] ? 'border-red-400 focus:ring-red-400' : ''}`}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => set(key, e.target.value)}
      />
      {errors[key] && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Building2 size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Mortgage Mates</p>
                <p className="text-xs text-slate-500">Broker Registration</p>
              </div>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < step ? 'bg-emerald-500 text-white' :
                    i === step ? 'bg-blue-600 text-white' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {i < step ? <Check size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === step ? 'text-slate-800' : 'text-slate-400'}`}>{s}</span>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="px-8 py-7">
            {/* Step 0: Details */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-5">Broker Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  {field('name', 'Full Name', 'text', 'Jane Smith')}
                  {field('companyName', 'Company Name', 'text', 'Acme Mortgages Ltd')}
                </div>
                {field('officeAddress', 'Registered Office Address', 'text', '123 High Street, London')}
                <div className="grid grid-cols-2 gap-4">
                  {field('postalCode', 'Postal Code', 'text', 'SW1A 1AA')}
                  {field('phoneNumber', 'Phone Number', 'tel', '+44 20 7000 0000')}
                </div>
                {field('email', 'Official Email Address', 'email', 'you@company.com')}
                <div className="grid grid-cols-2 gap-4">
                  {field('password', 'Password', 'password', '••••••••')}
                  {field('confirmPassword', 'Confirm Password', 'password', '••••••••')}
                </div>
                <button onClick={submitStep0} className="btn-primary w-full mt-2" disabled={loading}>
                  {loading ? 'Processing…' : 'Continue'}
                </button>
              </div>
            )}

            {/* Step 1: Email Verify */}
            {step === 1 && (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">📧</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
                <p className="text-slate-500 text-sm mb-1">
                  A verification email has been sent to:
                </p>
                <p className="font-semibold text-blue-600 mb-6">{form.email}</p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-left mb-6">
                  <p className="text-amber-800 text-sm font-medium mb-1">Demo Mode</p>
                  <p className="text-amber-700 text-xs">
                    In the real application, you'd click the link in your email. For this demo,
                    click the button below to simulate verification.
                  </p>
                </div>
                <button onClick={verifyEmail} className="btn-primary w-full" disabled={loading}>
                  {loading ? 'Verifying…' : 'Confirm Email Verification'}
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Choose Your Plan</h2>
                  <p className="text-slate-500 text-sm mt-1">Start processing mortgage applications today</p>
                </div>

                {/* Plan card */}
                <div className="border-2 border-blue-500 rounded-2xl p-5 mb-6 bg-blue-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900 text-lg">Standard Plan</p>
                      <p className="text-slate-500 text-xs">Unlimited applications · Priority support</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">£79</p>
                      <p className="text-slate-400 text-xs">/month</p>
                    </div>
                  </div>
                  {['Unlimited PDF extractions', 'Unique broker URL', 'Client signing portal', 'Admin reporting', 'Email notifications'].map(f => (
                    <div key={f} className="flex items-center gap-2 mt-2">
                      <Check size={13} className="text-emerald-500 shrink-0" />
                      <span className="text-xs text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Card form */}
                <div className="space-y-4">
                  <div>
                    <label className="label">Card Number</label>
                    <input className="input" placeholder="4242 4242 4242 4242" maxLength={19} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Expiry</label>
                      <input className="input" placeholder="MM / YY" maxLength={7} />
                    </div>
                    <div>
                      <label className="label">CVC</label>
                      <input className="input" placeholder="123" maxLength={4} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Cardholder Name</label>
                    <input className="input" placeholder={form.name} />
                  </div>
                </div>

                <button onClick={completePayment} className="btn-primary w-full mt-6" disabled={loading}>
                  {loading ? 'Processing payment…' : 'Pay £79 & Activate Account'}
                </button>
                <p className="text-center text-xs text-slate-400 mt-3">
                  🔒 Secured by Stripe. Cancel anytime.
                </p>
              </div>
            )}
          </div>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/broker/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
