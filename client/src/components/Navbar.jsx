import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="glass-nav border-b border-slate-200/80 sticky top-0 z-30 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Name */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-campus-600 via-indigo-600 to-campus-500 flex items-center justify-center text-white shadow-md shadow-campus-500/20 group-hover:scale-105 group-hover:shadow-campus-500/30 transition-all duration-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight block leading-tight group-hover:text-campus-600 transition-colors">
                CampusResolve
              </span>
              <span className="text-[11px] font-semibold text-slate-500 block leading-none tracking-wide">
                College Grievance Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50/70'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
              )}

              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/dashboard')
                    ? 'bg-campus-600 text-white shadow-sm shadow-campus-500/25'
                    : 'text-slate-600 hover:text-campus-600 hover:bg-campus-50/70'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.role === 'admin' ? 'Student View' : 'Dashboard'}
              </Link>

              <Link
                to="/complaints/new"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/complaints/new')
                    ? 'bg-campus-600 text-white shadow-sm shadow-campus-500/25'
                    : 'text-campus-600 bg-campus-50 hover:bg-campus-100/80 border border-campus-200/60'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Submit Complaint
              </Link>
            </nav>
          )}

          {/* Right Side: User Profile & Logout */}
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2.5 pl-3 py-1 pr-1.5 bg-slate-50/80 border border-slate-200/80 rounded-xl">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-campus-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="text-left pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-[9px] font-extrabold uppercase bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-md border border-purple-200">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight">
                    {user.studentId ? `ID: ${user.studentId}` : user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-200 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2.5">
              <Link
                to="/login"
                className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${
                  isActive('/login')
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/70'
                }`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-gradient-to-r from-campus-600 to-campus-700 hover:from-campus-700 hover:to-campus-800 text-white px-4 py-2 rounded-xl shadow-sm shadow-campus-500/20 hover:shadow-md transition-all hover:scale-[1.02]"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {user ? (
            <>
              <div className="pb-3 border-b border-slate-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-campus-100 text-campus-700 font-bold flex items-center justify-center text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-campus-700 bg-campus-50 text-sm font-semibold"
                >
                  <Shield className="w-4 h-4 text-campus-600" />
                  Admin Console
                </Link>
              )}

              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                {user.role === 'admin' ? 'Student View' : 'Dashboard'}
              </Link>

              <Link
                to="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-campus-600 bg-campus-50 text-sm font-semibold"
              >
                <PlusCircle className="w-4 h-4 text-campus-600" />
                Submit Complaint
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 text-sm font-semibold bg-campus-600 text-white rounded-lg"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
