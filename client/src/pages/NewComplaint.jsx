import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import {
  ArrowLeft,
  Upload,
  X,
  FileCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  MapPin,
  Tag,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES = [
  'Classroom',
  'Laboratory',
  'Hostel',
  'Wi-Fi',
  'Infrastructure',
  'Transportation',
  'Cleanliness',
  'Other',
];

const PRIORITIES = [
  { value: 'Low', label: 'Low', desc: 'Minor issue, cosmetic or low urgency', color: 'border-slate-300 peer-checked:border-slate-600 peer-checked:bg-slate-50' },
  { value: 'Medium', label: 'Medium', desc: 'Standard facility issue requiring attention', color: 'border-blue-300 peer-checked:border-blue-600 peer-checked:bg-blue-50' },
  { value: 'High', label: 'High', desc: 'Significant disruption to study or living', color: 'border-amber-300 peer-checked:border-amber-600 peer-checked:bg-amber-50' },
  { value: 'Critical', label: 'Critical', desc: 'Safety hazard, urgent power/water outage', color: 'border-rose-300 peer-checked:border-rose-600 peer-checked:bg-rose-50' },
];

const NewComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    location: '',
    priority: 'Medium',
    description: '',
  });

  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    // Check size (5MB limit)
    if (selected.size > 5 * 1024 * 1024) {
      setError('Selected file exceeds the 5MB maximum file size limit.');
      return;
    }

    setError('');
    setFile(selected);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(selected);
    } else {
      setFilePreview(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.location.trim() || !formData.description.trim()) {
      setError('Please provide a title, location, and detailed description.');
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionData = new FormData();
      submissionData.append('title', formData.title.trim());
      submissionData.append('category', formData.category);
      submissionData.append('location', formData.location.trim());
      submissionData.append('priority', formData.priority);
      submissionData.append('description', formData.description.trim());

      if (file) {
        submissionData.append('attachment', file);
      }

      const res = await complaintAPI.createComplaint(submissionData);
      if (res.success && res.complaint) {
        navigate(`/complaints/${res.complaint._id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(
        err.response?.data?.message || 'Failed to submit complaint. Please check the form.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-campus-600 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Lodge a Campus Facility Complaint
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Submit details regarding equipment malfunctions, room repairs, or campus services for swift departmental resolution.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-rose-50/90 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-2xl text-sm flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-semibold">{error}</div>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="glass-card rounded-3xl border border-slate-200/80 shadow-card p-6 sm:p-10 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Complaint Title *
          </label>
          <input
            type="text"
            name="title"
            required
            maxLength={120}
            placeholder="e.g. Broken projector in Room 302 / Wi-Fi outage in Library 2nd Floor"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all shadow-xs"
          />
          <span className="text-[11px] text-slate-400 font-medium block text-right mt-1">
            {formData.title.length}/120 characters
          </span>
        </div>

        {/* Category & Location Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-campus-500" />
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all appearance-none cursor-pointer shadow-xs"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-campus-500" />
              Specific Location *
            </label>
            <input
              type="text"
              name="location"
              required
              placeholder="e.g. Science Block, 3rd Floor, Lab 304"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            Priority Level *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = formData.priority === p.value;
              const borderStyles = isSelected
                ? p.value === 'Critical'
                  ? 'border-rose-500 bg-rose-50/80 ring-2 ring-rose-300/60 shadow-sm'
                  : p.value === 'High'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300/60 shadow-sm'
                  : p.value === 'Medium'
                  ? 'border-campus-500 bg-campus-50/80 ring-2 ring-campus-300/60 shadow-sm'
                  : 'border-slate-500 bg-slate-100 ring-2 ring-slate-300/60 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60';

              return (
                <label
                  key={p.value}
                  className={`relative flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${borderStyles}`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={isSelected}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-sm text-slate-900">
                      {p.label}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-campus-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 leading-snug font-medium">
                    {p.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Detailed Description *
          </label>
          <textarea
            name="description"
            required
            rows={5}
            placeholder="Please describe the issue thoroughly (e.g. when did it start, symptoms, impact on classes, exact equipment details)..."
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-campus-500 focus:border-transparent transition-all resize-y shadow-xs"
          />
        </div>

        {/* File Attachment */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1.5">
            Supporting Attachment (Optional)
          </label>
          <p className="text-xs text-slate-500 font-medium mb-3">
            Attach a clear photo of the malfunction or a relevant document (PNG, JPG, WEBP, PDF up to 5MB).
          </p>

          {!file ? (
            <label className="border-2 border-dashed border-slate-300 hover:border-campus-400 bg-slate-50/70 hover:bg-campus-50/40 rounded-2xl p-7 flex flex-col items-center justify-center cursor-pointer transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-campus-600 group-hover:scale-105 transition-all shadow-xs mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-800 group-hover:text-campus-700">
                Click to browse or drag and drop photo
              </span>
              <span className="text-xs text-slate-400 mt-1 font-medium">
                Maximum file size: 5MB (PNG, JPG, WEBP, PDF)
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3.5 overflow-hidden">
                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Upload Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 bg-campus-50 text-campus-600 rounded-xl flex items-center justify-center shrink-0 border border-campus-100">
                    <FileCheck className="w-7 h-7" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 font-semibold">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Remove attachment"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Submit & Cancel Actions */}
        <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/dashboard"
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-campus-600 via-campus-600 to-indigo-600 hover:from-campus-700 hover:to-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-campus-500/25 hover:shadow-lg transition-all hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting Complaint...
              </>
            ) : (
              'Submit Complaint'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewComplaint;
