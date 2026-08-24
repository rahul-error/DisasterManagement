import { useState, FormEvent } from 'react';
import { ShieldAlert, Users, Building2, Mail, Lock, User, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/database';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      if (error) setError(error);
    } else {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      const { error } = await signUp(email, password, fullName, role, pinCode);
      if (error) setError(error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - branding */}
      <div className="relative lg:w-1/2 bg-navy-900 text-white p-8 lg:p-12 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-emergency-500 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-52 h-52 rounded-full bg-safety-500 blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emergency-600 flex items-center justify-center shadow-lg">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">DisasterReady</h1>
              <p className="text-xs text-navy-300">NDRF / SDRF Public Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-12 lg:my-0">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Bridging agencies & citizens for disaster preparedness
          </h2>
          <p className="text-navy-300 text-base leading-relaxed max-w-md">
            Early warnings, safety drills, and life-saving resources — all in one place.
            Stay informed, stay prepared, stay safe.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-2 h-2 rounded-full bg-emergency-500" />
              Real-time emergency broadcast alerts
            </div>
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-2 h-2 rounded-full bg-safety-500" />
              Register for safety drills & awareness programmes
            </div>
            <div className="flex items-center gap-3 text-sm text-navy-200">
              <div className="w-2 h-2 rounded-full bg-warning-400" />
              Do's & Don'ts for every disaster type
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-navy-400">
          For demonstration purposes only. Not affiliated with NDRF/SDRF.
        </div>
      </div>

      {/* Right side - auth form */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-navy-50">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-900">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-navy-500 mt-1">
              {mode === 'signin'
                ? 'Sign in to access your dashboard'
                : 'Join to register for drills and receive alerts'}
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-emergency-50 p-3.5 text-sm text-emergency-700 ring-1 ring-inset ring-emergency-200 animate-fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-2">Account Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('citizen')}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === 'citizen'
                          ? 'border-navy-900 bg-navy-50'
                          : 'border-navy-200 bg-white hover:border-navy-300'
                      }`}
                    >
                      <Users className={`w-6 h-6 ${role === 'citizen' ? 'text-navy-900' : 'text-navy-400'}`} />
                      <span className={`text-sm font-medium ${role === 'citizen' ? 'text-navy-900' : 'text-navy-500'}`}>
                        Citizen
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all ${
                        role === 'admin'
                          ? 'border-emergency-600 bg-emergency-50'
                          : 'border-navy-200 bg-white hover:border-navy-300'
                      }`}
                    >
                      <Building2 className={`w-6 h-6 ${role === 'admin' ? 'text-emergency-600' : 'text-navy-400'}`} />
                      <span className={`text-sm font-medium ${role === 'admin' ? 'text-emergency-700' : 'text-navy-500'}`}>
                        Agency Admin
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">PIN Code</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400" />
                    <input
                      type="text"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="input-field pl-10"
                      placeholder="e.g. 110001"
                    />
                </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-navy-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-base mt-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-navy-500">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
              }}
              className="font-semibold text-navy-900 hover:underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
