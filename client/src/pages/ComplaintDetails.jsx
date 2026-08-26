import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import StatusTimeline from '../components/StatusTimeline';
import LoadingSpinner from '../components/LoadingSpinner';
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
} from 'lucide-react';

const ComplaintDetails = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await complaintAPI.getComplaintById(id);
        setComplaint(data.complaint);
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
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Complaints Dashboard
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          ID: {complaint._id}
        </span>
      </div>

      {/* Main Complaint Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="lg" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
          {complaint.title}
        </h1>

        {/* Metadata Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-campus-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
              <span className="font-semibold text-slate-800">{complaint.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-campus-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Submitted Date</span>
              <span className="font-semibold text-slate-800">
                {new Date(complaint.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-campus-600 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Last Updated</span>
              <span className="font-semibold text-slate-800">
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
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 sm:p-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Resolution Lifecycle
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-campus-600" />
              Detailed Description
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
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
