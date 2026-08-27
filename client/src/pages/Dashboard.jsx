import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  PlusCircle,
  Search,
  Filter,
  RotateCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Other',
];

const STATUSES = [
  'All',
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

const Dashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const fetchComplaints = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const params = {};
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();

      const data = await complaintAPI.getComplaints(params);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError(
        err.response?.data?.message || 'Failed to load your complaints. Please try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedStatus, search]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Derived metrics from current complaints (or unfiltered stats)
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress' || c.status === 'Assigned'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved' || c.status === 'Closed'
  ).length;
  const pendingCount = complaints.filter(
    (c) => c.status === 'Submitted' || c.status === 'Under Review'
  ).length;

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-campus-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-indigo-800/40">
        {/* Background glow circle */}
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-campus-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-campus-200 backdrop-blur-md border border-white/10 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Campus Facilities & Grievance Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
            Lodge, track, and monitor campus facility grievances in real-time. Submissions route directly to university facility coordinators.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="z-10 inline-flex items-center gap-2.5 bg-white text-campus-900 hover:text-campus-950 font-extrabold px-6 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] shrink-0 border border-white/40 cursor-pointer"
        >
          <PlusCircle className="w-5 h-5 text-campus-600" />
          Submit New Complaint
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total */}
        <div className="glass-card rounded-2xl border border-slate-200/80 border-t-4 border-t-campus-500 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Grievances</span>
            <div className="w-9 h-9 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{totalCount}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Submitted through your account</p>
        </div>

        {/* Pending */}
        <div className="glass-card rounded-2xl border border-slate-200/80 border-t-4 border-t-amber-500 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Awaiting staff department triage</p>
        </div>

        {/* In Progress */}
        <div className="glass-card rounded-2xl border border-slate-200/80 border-t-4 border-t-indigo-500 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">In Progress</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Under active technical repair</p>
        </div>

        {/* Resolved */}
        <div className="glass-card rounded-2xl border border-slate-200/80 border-t-4 border-t-emerald-500 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Resolved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Successfully addressed & closed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search complaints by title, keyword, or room location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all shadow-xs"
            />
          </div>

          {/* Select Dropdowns & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            {(search || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-campus-600 hover:text-campus-800 px-3 py-2 rounded-xl hover:bg-campus-50 border border-campus-200 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchComplaints(true)}
              title="Refresh complaints list"
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Grid / Loading / Empty State */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Your Grievances Queue</h2>
            <span className="text-xs font-extrabold bg-campus-100 text-campus-700 px-2.5 py-0.5 rounded-full border border-campus-200">
              {complaints.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm mb-6 flex items-center gap-2.5 shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Fetching your submitted complaints..." size="lg" />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints found"
            description={
              search || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'No grievances match your current search or filter criteria. Try resetting filters.'
                : 'You have not submitted any campus complaints yet. Encountered an issue with facility, Wi-Fi, or hostel? Let the college staff know!'
            }
            actionText="Submit Your First Complaint"
            actionTo="/complaints/new"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((complaint) => (
              <ComplaintCard key={complaint._id} complaint={complaint} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
