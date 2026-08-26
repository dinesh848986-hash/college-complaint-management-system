import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  User,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Inbox,
  FolderOpen,
} from 'lucide-react';
import { complaintAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import LoadingSpinner from '../components/LoadingSpinner';

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

const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  // Quick Action Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalDepartment, setModalDepartment] = useState('');
  const [modalStaff, setModalStaff] = useState('');
  const [modalComment, setModalComment] = useState('');
  const [modalResolution, setModalResolution] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const fetchComplaints = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      const params = {};
      if (category !== 'All') params.category = category;
      if (status !== 'All') params.status = status;
      if (priority !== 'All') params.priority = priority;
      if (search.trim() !== '') params.search = search.trim();

      const data = await complaintAPI.getAdminComplaints(params);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch complaints. Please verify server connection.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [category, status, priority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('All');
    setStatus('All');
    setPriority('All');
  };

  // Real KPI statistics calculated from actual complaint array
  const stats = useMemo(() => {
    const total = complaints.length;
    let submitted = 0;
    let underReview = 0;
    let assigned = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;
    let critical = 0;

    complaints.forEach((c) => {
      if (c.status === 'Submitted') submitted++;
      else if (c.status === 'Under Review') underReview++;
      else if (c.status === 'Assigned') assigned++;
      else if (c.status === 'In Progress') inProgress++;
      else if (c.status === 'Resolved') resolved++;
      else if (c.status === 'Closed') closed++;

      if (c.priority === 'Critical') critical++;
    });

    return {
      total,
      submitted,
      underReview,
      assigned,
      inProgress,
      resolved,
      closed,
      critical,
    };
  }, [complaints]);

  // Open Quick Edit Modal
  const openQuickEdit = (complaint) => {
    setSelectedComplaint(complaint);
    setModalStatus(complaint.status);
    setModalDepartment(complaint.assignedDepartment || '');
    setModalStaff(complaint.assignedStaff || '');
    setModalComment(complaint.adminComments || '');
    setModalResolution(complaint.resolutionDetails || '');
    setModalError('');
    setModalSuccess('');
  };

  // Submit Quick Edit
  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setModalSubmitting(true);
      setModalError('');
      setModalSuccess('');

      const updatePayload = {
        status: modalStatus,
        assignedDepartment: modalDepartment,
        assignedStaff: modalStaff,
        adminComments: modalComment,
        resolutionDetails: modalResolution,
      };

      const res = await complaintAPI.updateComplaint(selectedComplaint._id, updatePayload);
      setModalSuccess('Complaint updated successfully!');

      // Update local state smoothly
      setComplaints((prev) =>
        prev.map((c) => (c._id === selectedComplaint._id ? res.complaint : c))
      );

      setTimeout(() => {
        setSelectedComplaint(null);
      }, 1000);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to update complaint.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-campus-100 text-campus-700">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-campus-700 bg-campus-50 px-2.5 py-0.5 rounded-full border border-campus-200">
              Administrative Console
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Grievance Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review, assign, and track resolution lifecycles across all university facilities
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchComplaints(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 shadow-xs transition-all disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-campus-600' : ''}`} />
            Refresh Queue
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - 8 Real Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4 mb-8">
        {/* Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total
          </span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats.total}</div>
          <span className="text-[10px] text-slate-500">Campus-wide</span>
        </div>

        {/* Submitted */}
        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider block">
            Submitted
          </span>
          <div className="text-2xl font-extrabold text-sky-900 mt-1">{stats.submitted}</div>
          <span className="text-[10px] text-sky-600">New intake</span>
        </div>

        {/* Under Review */}
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
            Reviewing
          </span>
          <div className="text-2xl font-extrabold text-amber-900 mt-1">{stats.underReview}</div>
          <span className="text-[10px] text-amber-600">Initial review</span>
        </div>

        {/* Assigned */}
        <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
            Assigned
          </span>
          <div className="text-2xl font-extrabold text-purple-900 mt-1">{stats.assigned}</div>
          <span className="text-[10px] text-purple-600">Staff assigned</span>
        </div>

        {/* In Progress */}
        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
            In Progress
          </span>
          <div className="text-2xl font-extrabold text-indigo-900 mt-1">{stats.inProgress}</div>
          <span className="text-[10px] text-indigo-600">Active repairs</span>
        </div>

        {/* Resolved */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            Resolved
          </span>
          <div className="text-2xl font-extrabold text-emerald-900 mt-1">{stats.resolved}</div>
          <span className="text-[10px] text-emerald-600">Fixed</span>
        </div>

        {/* Closed */}
        <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Closed
          </span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{stats.closed}</div>
          <span className="text-[10px] text-slate-500">Archived</span>
        </div>

        {/* Critical */}
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
            Critical
          </span>
          <div className="text-2xl font-extrabold text-rose-900 mt-1">{stats.critical}</div>
          <span className="text-[10px] text-rose-600">Urgent action</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-soft mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by title, location, student name, or staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            {/* Category Filter */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-campus-500"
            >
              <option disabled>Category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Categories' : c}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-campus-500"
            >
              <option disabled>Status</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Statuses' : s}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-campus-500"
            >
              <option disabled>Priority</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : `${p} Priority`}
                </option>
              ))}
            </select>

            {/* Submit / Reset */}
            <button
              type="submit"
              className="bg-campus-600 hover:bg-campus-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              Filter
            </button>

            {(search || category !== 'All' || status !== 'All' || priority !== 'All') && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-2"
              >
                Reset
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchComplaints()}
            className="text-xs font-semibold underline hover:text-rose-800"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200/80 shadow-soft">
          <LoadingSpinner text="Retrieving campus complaints queue..." size="lg" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-soft">
          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">No Complaints Found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">
            No student grievances match your current search and filter settings.
          </p>
          <button
            onClick={handleResetFilters}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold text-slate-500">
                  <th className="py-3.5 px-4">Grievance & Submitter</th>
                  <th className="py-3.5 px-4">Category & Location</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Department & Staff</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {complaints.map((c) => (
                  <tr
                    key={c._id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Title & Submitter */}
                    <td className="py-4 px-4 max-w-xs">
                      <Link
                        to={`/complaints/${c._id}`}
                        className="font-semibold text-slate-900 hover:text-campus-600 block truncate group-hover:text-campus-600 transition-colors"
                      >
                        {c.title}
                      </Link>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <User className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {c.student?.name || 'Student'}
                        </span>
                        {c.student?.department && (
                          <>
                            <span>•</span>
                            <span className="truncate">{c.student.department}</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Category & Location */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">
                        {c.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3 h-3 shrink-0 text-slate-400" />
                        <span className="truncate max-w-[150px]">{c.location}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Assignment */}
                    <td className="py-4 px-4 max-w-[180px]">
                      {c.assignedDepartment || c.assignedStaff ? (
                        <div>
                          {c.assignedDepartment && (
                            <div className="flex items-center gap-1 text-xs font-medium text-slate-800 truncate">
                              <Building className="w-3 h-3 shrink-0 text-campus-600" />
                              <span className="truncate">{c.assignedDepartment}</span>
                            </div>
                          )}
                          {c.assignedStaff && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-0.5">
                              <UserCheck className="w-3 h-3 shrink-0 text-slate-400" />
                              <span className="truncate">{c.assignedStaff}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openQuickEdit(c)}
                          className="px-2.5 py-1 bg-campus-50 hover:bg-campus-100 text-campus-700 text-xs font-semibold rounded-lg border border-campus-200 transition-colors"
                        >
                          Quick Action
                        </button>
                        <Link
                          to={`/complaints/${c._id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Complaint Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout (< lg screens) */}
          <div className="lg:hidden divide-y divide-slate-100">
            {complaints.map((c) => (
              <div key={c._id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      ID: #{c._id.slice(-6)}
                    </span>
                    <Link
                      to={`/complaints/${c._id}`}
                      className="font-bold text-slate-900 hover:text-campus-600 text-base"
                    >
                      {c.title}
                    </Link>
                  </div>
                  <PriorityBadge priority={c.priority} />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <StatusBadge status={c.status} size="sm" />
                  <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                    {c.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{c.location}</span>
                  </div>
                </div>

                {/* Submitter info */}
                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-campus-100 text-campus-700 flex items-center justify-center font-bold text-[10px]">
                      {c.student?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">
                        {c.student?.name || 'Student'}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {c.student?.studentId || c.student?.department || 'Student Submitter'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Assignment & Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-slate-500">
                    {c.assignedStaff ? (
                      <span className="text-slate-700 font-medium">
                        Assigned: {c.assignedStaff}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Unassigned</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openQuickEdit(c)}
                      className="px-3 py-1.5 bg-campus-50 hover:bg-campus-100 text-campus-700 text-xs font-semibold rounded-lg border border-campus-200 transition-colors"
                    >
                      Update
                    </button>
                    <Link
                      to={`/complaints/${c._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                    >
                      Details
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-campus-600">
                  Update Grievance #{selectedComplaint._id.slice(-6)}
                </span>
                <h3 className="font-bold text-slate-900 text-lg leading-tight mt-0.5">
                  {selectedComplaint.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            {modalSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{modalSuccess}</span>
              </div>
            )}

            {modalError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleQuickEditSubmit} className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Resolution Status
                </label>
                <select
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                >
                  {STATUSES.filter((s) => s !== 'All').map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Assignment */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Electrical & HVAC Maintenance, Campus IT..."
                  value={modalDepartment}
                  onChange={(e) => setModalDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                />
              </div>

              {/* Staff Assignment */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Assigned Staff / Technician
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Miller (Senior Technician)"
                  value={modalStaff}
                  onChange={(e) => setModalStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                />
              </div>

              {/* Admin Comments */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Administrative Note / Comment
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal notes or updates to the student..."
                  value={modalComment}
                  onChange={(e) => setModalComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                />
              </div>

              {/* Resolution Details (Visible especially if Resolved/Closed) */}
              {(modalStatus === 'Resolved' || modalStatus === 'Closed') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
                    Resolution Summary Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe how the grievance was resolved for campus records..."
                    value={modalResolution}
                    onChange={(e) => setModalResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 bg-campus-600 hover:bg-campus-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-60"
                >
                  {modalSubmitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
