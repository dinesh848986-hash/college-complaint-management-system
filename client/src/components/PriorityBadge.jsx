import React from 'react';

const priorityConfig = {
  Low: {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    bar: 'bg-slate-400',
  },
  Medium: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    bar: 'bg-blue-500',
  },
  High: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    bar: 'bg-amber-500',
  },
  Critical: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-600',
  },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium border ${config.bg}`}
    >
      <span className={`w-1 h-3 rounded-full ${config.bar}`} />
      {priority} Priority
    </span>
  );
};

export default PriorityBadge;
