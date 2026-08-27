import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Paperclip, ArrowRight } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const ComplaintCard = ({ complaint }) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const priorityAccent =
    complaint.priority === 'Critical'
      ? 'border-l-4 border-l-rose-500'
      : complaint.priority === 'High'
      ? 'border-l-4 border-l-amber-500'
      : complaint.priority === 'Medium'
      ? 'border-l-4 border-l-campus-500'
      : 'border-l-4 border-l-slate-300';

  return (
    <div className={`glass-card rounded-2xl border border-slate-200/90 ${priorityAccent} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 p-5 sm:p-6 flex flex-col justify-between group hover:border-campus-300 relative overflow-hidden`}>
      <div>
        {/* Top Header: Category, Priority, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100/90 text-slate-700 border border-slate-200/60">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-campus-600 transition-colors line-clamp-1 mb-2">
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed font-normal">
          {complaint.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-campus-500 shrink-0" />
            <span className="truncate max-w-[170px] text-xs font-semibold">
              {complaint.location}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {formattedDate}
            </span>
            {complaint.attachment && complaint.attachment.url && (
              <span className="flex items-center gap-1 text-campus-600 font-bold bg-campus-50 px-1.5 py-0.5 rounded-md text-[10px]">
                <Paperclip className="w-3 h-3" />
                Attachment
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/complaints/${complaint._id}`}
          className="inline-flex items-center gap-1.5 font-bold text-xs text-campus-700 hover:text-campus-800 bg-campus-50 hover:bg-campus-100 border border-campus-200/80 px-3.5 py-2 rounded-xl transition-all shadow-2xs hover:shadow-xs group-hover:bg-campus-600 group-hover:text-white group-hover:border-campus-600 cursor-pointer"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
