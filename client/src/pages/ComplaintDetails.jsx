import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusTimeline from '../components/StatusTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Tag,
  Paperclip,
  Building,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  FileText,
  AlertCircle,
  Shield,
  Save,
  UserCheck,
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Admin Management Form State
  const [adminStatus, setAdminStatus] = useState('');
  const [adminDepartment, setAdminDepartment] = useState('');
  const [adminStaff, setAdminStaff] = useState('');
  const [adminComments, setAdminComments] = useState('');
  const [adminResolution, setAdminResolution] = useState('');
  const [adminSaving, setAdminSaving] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState('');
  const [adminError, setAdminError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await complaintAPI.getComplaintById(id);
        setComplaint(data.complaint);

        // Populate admin form initial state
        if (data.complaint) {
          setAdminStatus(data.complaint.status || 'Submitted');
          setAdminDepartment(data.complaint.assignedDepartment || '');
          setAdminStaff(data.complaint.assignedStaff || '');
          setAdminComments(data.complaint.adminComments || '');
          setAdminResolution(data.complaint.resolutionDetails || '');
        }
      } catch (err) {
        console.error('Error fetching complaint details:', err);
        setError(
          err.response?.data?.message || 'Unable to retrieve complaint details.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAdminUpdate = async (e) => {
    e.preventDefault();
    try {
      setAdminSaving(true);
      setAdminError('');
      setAdminSuccess('');

      const payload = {
        status: adminStatus,
        assignedDepartment: adminDepartment,
        assignedStaff: adminStaff,
        adminComments: adminComments,
        resolutionDetails: adminResolution,
      };

      const res = await complaintAPI.updateComplaint(id, payload);
      setComplaint(res.complaint);
      setAdminSuccess('Complaint successfully updated!');
    } catch (err) {
      console.error('Admin update failed:', err);
      setAdminError(
        err.response?.data?.message || 'Failed to update complaint. Please try again.'
      );
    } finally {
      setAdminSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <LoadingSpinner text="Loading complaint details..." size="lg" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Unable to Load Complaint</h2>
          <p className="text-sm mt-1 mb-4">{error || 'Complaint not found'}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isImageAttachment =
    complaint.attachment?.mimetype?.startsWith('image/') ||
    complaint.attachment?.filename?.match(/\.(jpeg|jpg|png|webp|gif)$/i);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link
          to={user?.role === 'admin' ? '/admin' : '/dashboard'}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-campus-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          {user?.role === 'admin'
            ? 'Back to Administration Console'
            : 'Back to Complaints Dashboard'}
        </Link>
        <span className="text-xs text-slate-400 font-mono font-medium">
          ID: {complaint._id}
        </span>
      </div>

      {/* Main Complaint Header Card */}
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/60">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="lg" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-4">
          {complaint.title}
        </h1>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
              <span className="font-bold text-slate-800">{complaint.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
              <span className="font-bold text-slate-800">
                {new Date(complaint.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-campus-50 text-campus-600 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Updated</span>
              <span className="font-bold text-slate-800">
                {new Date(complaint.updatedAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Lifecycle Stepper */}
      <div className="glass-card rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Resolution Lifecycle Progress
        </h2>
        <StatusTimeline
          currentStatus={complaint.status}
          statusHistory={complaint.statusHistory}
        />
      </div>

      {/* Grid: Description & Attachment (Left) + Administrative Resolution Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <div className="glass-card rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-7">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-campus-600" />
              Detailed Description
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 font-normal">
              {complaint.description}
            </div>
          </div>

          {/* Attachment Preview (if any) */}
          {complaint.attachment && complaint.attachment.url && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-campus-600" />
                Supporting Attachment
              </h2>

              {isImageAttachment ? (
                <div className="space-y-3">
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center max-h-96">
                    <img
                      src={complaint.attachment.url}
                      alt="Complaint attachment"
                      className="max-h-96 w-auto object-contain"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{complaint.attachment.originalName || 'Attachment image'}</span>
                    <a
                      href={complaint.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-campus-600 font-semibold hover:underline"
                    >
                      Open full size <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-campus-100 text-campus-700 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {complaint.attachment.originalName || 'Document Attachment'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {complaint.attachment.size
                          ? `${(complaint.attachment.size / 1024).toFixed(1)} KB`
                          : 'Document file'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={complaint.attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-campus-600 hover:bg-slate-50"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1 Col) - Administrative Status & Staff Details */}
        <div className="space-y-6">
          {/* Admin Management Panel (Rendered only for role === 'admin') */}
          {user?.role === 'admin' && (
            <div className="bg-white rounded-2xl border-2 border-campus-200 shadow-soft p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <div className="p-1.5 rounded-lg bg-campus-100 text-campus-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Administrator Controls
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Update lifecycle status, staff assignment, and resolution notes
                  </p>
                </div>
              </div>

              {adminSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{adminSuccess}</span>
                </div>
              )}

              {adminError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminUpdate} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Status Lifecycle
                  </label>
                  <select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assigned Department
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Electrical & HVAC Maintenance"
                    value={adminDepartment}
                    onChange={(e) => setAdminDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Assigned Staff / Technician
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. David Miller (Senior Tech)"
                    value={adminStaff}
                    onChange={(e) => setAdminStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Administrative Note / Comment
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Internal comment or staff update for student..."
                    value={adminComments}
                    onChange={(e) => setAdminComments(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-campus-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800 mb-1">
                    Resolution Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Document how this issue was resolved..."
                    value={adminResolution}
                    onChange={(e) => setAdminResolution(e.target.value)}
                    className="w-full px-3 py-2 bg-emerald-50/40 border border-emerald-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={adminSaving}
                  className="w-full bg-campus-600 hover:bg-campus-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" />
                  {adminSaving ? 'Applying Changes...' : 'Save & Update Grievance'}
                </button>
              </form>
            </div>
          )}

          {/* Department & Staff Assignment */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-campus-600" />
              Administrative Assignment
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Assigned Department</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {complaint.assignedDepartment || 'Pending Assignment'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-medium block">Assigned Personnel</span>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {complaint.assignedStaff || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Admin Comments & Resolution Info */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-campus-600" />
              Facility Remarks
            </h2>

            {complaint.adminComments ? (
              <div>
                <span className="text-xs text-slate-400 font-medium block">Staff Note</span>
                <p className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg mt-1 leading-relaxed">
                  {complaint.adminComments}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No administrative notes added yet.
              </p>
            )}

            {complaint.resolutionDetails && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs text-emerald-700 font-semibold block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolution Summary
                </span>
                <p className="text-xs text-slate-700 bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-lg mt-1 leading-relaxed">
                  {complaint.resolutionDetails}
                </p>
              </div>
            )}
          </div>

          {/* Submitter Info */}
          {complaint.student && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
              <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-campus-600" />
                Submitted By
              </h2>
              <div className="text-xs space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-800">{complaint.student.name}</p>
                <p className="text-slate-500">{complaint.student.email}</p>
                {complaint.student.studentId && (
                  <p className="text-slate-500">Roll No: {complaint.student.studentId}</p>
                )}
                {complaint.student.department && (
                  <p className="text-slate-500">Dept: {complaint.student.department}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;
