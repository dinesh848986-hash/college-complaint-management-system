import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(() => location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await login(cleanEmail, password);
      const userRole = res?.user?.role || res?.role;
      const defaultDest = userRole === 'admin' ? '/admin' : '/dashboard';
      const destination = from !== '/dashboard' ? from : defaultDest;
      navigate(destination, { replace: true });
    } catch (err) {
      console.error('[Login] Authentication error:', err);
      setError(
        err.response?.data?.message || 'Invalid email or password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoStudent = () => {
    setEmail('student@campus.edu');
    setPassword('student123');
    setError('');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@campus.edu');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-campus-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="glass-card rounded-3xl border border-slate-200/80 shadow-card p-8 sm:p-10 transition-all">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-campus-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3.5 shadow-md shadow-campus-500/20">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Sign in to manage and track college facility complaints
            </p>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 border border-slate-200/60">
            <div className="w-1/2 py-2 text-center text-xs font-bold text-campus-700 bg-white rounded-xl shadow-xs">
              Sign In
            </div>
            <Link
              to="/register"
              className="w-1/2 py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              Create Account
            </Link>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50/90 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm flex items-start gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username email"
                  required
                  placeholder="name@gmail.com or student@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all shadow-xs"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 bg-gradient-to-r from-campus-600 via-campus-600 to-indigo-600 hover:from-campus-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-campus-500/25 hover:shadow-lg hover:shadow-campus-500/35 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Portal
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-7 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={fillDemoStudent}
                className="bg-slate-50 hover:bg-slate-100/90 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200/80 transition-all hover:border-campus-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-campus-600 shrink-0" />
                Demo Student
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="bg-slate-50 hover:bg-slate-100/90 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-200/80 transition-all hover:border-purple-300 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                Demo Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            New student or faculty member?{' '}
            <Link
              to="/register"
              className="text-campus-600 font-bold hover:text-campus-700 hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
