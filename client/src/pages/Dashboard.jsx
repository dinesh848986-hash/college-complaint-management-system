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
      <div className="bg-gradient-to-r from-campus-900 via-campus-800 to-campus-700 rounded-2xl p-6 sm:p-8 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-campus-100 backdrop-blur-xs">
            Student Complaint Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="text-campus-100 text-sm max-w-xl">
            Track and manage your campus grievances. All submissions are dispatched
            directly to the respective facilities and maintenance teams.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="z-10 inline-flex items-center gap-2 bg-white text-campus-800 hover:bg-campus-50 font-bold px-5 py-3 rounded-xl shadow-md transition-all hover:scale-[1.02] shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-campus-600" />
          Submit New Complaint
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Complaints</span>
            <div className="w-8 h-8 rounded-lg bg-campus-50 text-campus-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Submitted through your account</p>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting department triage</p>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Assigned or under active repair</p>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-soft">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Successfully addressed</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search complaints by title or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500 transition-all"
            />
          </div>

          {/* Select Dropdowns & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Select */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-400 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none py-1 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none py-1 cursor-pointer"
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
                className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-100"
              >
                Reset
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => fetchComplaints(true)}
              title="Refresh complaints list"
              disabled={refreshing}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200/80 transition-colors disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Complaints Grid / Loading / Empty State */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Your Complaints</h2>
            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {complaints.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
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
