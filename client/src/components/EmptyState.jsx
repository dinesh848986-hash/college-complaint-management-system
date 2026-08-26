import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, PlusCircle } from 'lucide-react';

const EmptyState = ({
  title = 'No complaints found',
  description = 'You have not submitted any complaints matching this filter.',
  actionText = 'Submit a Complaint',
  actionTo = '/complaints/new',
}) => {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-8">
      <div className="w-16 h-16 bg-campus-50 text-campus-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6">{description}</p>
      {actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 bg-campus-600 hover:bg-campus-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
