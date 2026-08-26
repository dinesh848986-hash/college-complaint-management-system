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

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-soft hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between group hover:border-campus-300">
      <div>
        {/* Top Header: Category, Priority, Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 text-lg group-hover:text-campus-600 transition-colors line-clamp-1 mb-2">
          {complaint.title}
        </h3>

        {/* Description snippet */}
        <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate max-w-[180px] font-medium">
              {complaint.location}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              {formattedDate}
            </span>
            {complaint.attachment && complaint.attachment.url && (
              <span className="flex items-center gap-1 text-campus-600 font-medium">
                <Paperclip className="w-3.5 h-3.5" />
                Attachment
              </span>
            )}
          </div>
        </div>

        <Link
          to={`/complaints/${complaint._id}`}
          className="inline-flex items-center gap-1 font-medium text-campus-600 hover:text-campus-700 bg-campus-50 hover:bg-campus-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ComplaintCard;
