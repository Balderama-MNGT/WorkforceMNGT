import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Briefcase, Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const DEMO_ACCOUNTS = [
  { role: 'Administrator', label: 'HR Manager / Admin', email: 'admin@workforcepro.com', password: 'Admin@123', icon: ShieldCheck },
  { role: 'Employee', label: 'Employee', email: 'employee@workforcepro.com', password: 'Employee@123', icon: UserRound },
];

export default function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    // Simulate a brief network round-trip for a realistic feel
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.success) {
        setError('Invalid email or password. Please try again.');
        return;
      }
      toast.success('Welcome back!', `Signed in as ${result.user.firstName} ${result.user.lastName}`);
      navigate(from || '/', { replace: true });
    }, 500);
  };

  const fillDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-[#0B1F3A] relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">WorkForce</h1>
            <p className="text-blue-300/60 text-xs font-medium">Pro Management</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-white text-3xl font-bold leading-tight tracking-tight mb-4">
            Manage your workforce,<br />all in one place.
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-md">
            Track attendance, schedules, leave, and timesheets for your whole team &mdash; or check
            your own, if that's all you need.
          </p>
        </div>

        <p className="relative text-slate-500 text-xs">&copy; {new Date().getFullYear()} WorkForce Pro Management. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900 font-bold text-[15px] leading-tight tracking-tight">WorkForce</h1>
              <p className="text-gray-400 text-[11px] font-medium">Pro Management</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="you@workforcepro.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-[13px] font-medium text-blue-600 hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-gray-200 bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 placeholder:text-gray-400 hover:border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">Demo accounts</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => fillDemoAccount(account)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors px-3 py-3 text-center"
                >
                  <account.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">{account.label}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-3">Click a card to autofill demo credentials</p>
          </div>
        </div>
      </div>
    </div>
  );
}
