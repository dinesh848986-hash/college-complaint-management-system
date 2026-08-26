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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Name */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-campus-700 to-campus-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
                CampusResolve
              </span>
              <span className="text-[11px] font-medium text-slate-500 block leading-none">
                College Complaint Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-2">
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-campus-600 text-white shadow-sm'
                      : 'bg-campus-50 text-campus-700 hover:bg-campus-100 font-semibold'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
              )}

              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-campus-50 text-campus-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {user.role === 'admin' ? 'Student View' : 'Dashboard'}
              </Link>

              <Link
                to="/complaints/new"
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/complaints/new')
                    ? 'bg-campus-600 text-white shadow-sm'
                    : user.role === 'admin'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    : 'bg-campus-50 text-campus-700 hover:bg-campus-100'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Submit Complaint
              </Link>
            </nav>
          )}

          {/* Right Side: User Profile & Logout */}
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </span>
                    {user.role === 'admin' && (
                      <span className="text-[9px] font-extrabold uppercase bg-campus-100 text-campus-700 px-1.5 py-0.5 rounded border border-campus-200">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 leading-tight">
                    {user.studentId ? `ID: ${user.studentId}` : user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-campus-600 hover:bg-campus-700 text-white px-4 py-2 rounded-lg shadow-sm"
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
