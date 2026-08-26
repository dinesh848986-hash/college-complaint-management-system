import React from 'react';
import { CheckCircle2, Clock, CircleDot, AlertCircle } from 'lucide-react';

const STAGES = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

const StatusTimeline = ({ currentStatus, statusHistory = [] }) => {
  const currentIndex = STAGES.indexOf(currentStatus);

  // Map history to map of { status: historyItem }
  const historyMap = {};
  statusHistory.forEach((h) => {
    historyMap[h.status] = h;
  });

  return (
    <div className="w-full py-4">
      {/* Desktop / Tablet view */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
          <div
            className="h-full bg-campus-600 transition-all duration-500 ease-out"
            style={{
              width: `${Math.max(0, (currentIndex / (STAGES.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const historyEntry = historyMap[stage];

          return (
            <div
              key={stage}
              className="flex flex-col items-center text-center relative z-10 w-28"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-campus-600 border-campus-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-white border-campus-600 text-campus-600 shadow-md ring-4 ring-campus-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : isCurrent ? (
                  <CircleDot className="w-5 h-5 animate-pulse" />
                ) : (
                  <span className="text-xs font-semibold">{idx + 1}</span>
                )}
              </div>

              <span
                className={`mt-2 text-xs font-semibold tracking-tight ${
                  isCurrent
                    ? 'text-campus-800 font-bold'
                    : isCompleted
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }`}
              >
                {stage}
              </span>

              {historyEntry && historyEntry.changedAt && (
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {new Date(historyEntry.changedAt).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stacked view */}
      <div className="flex flex-col space-y-4 md:hidden">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const historyEntry = historyMap[stage];

          return (
            <div key={stage} className="flex items-start gap-3 relative">
              {idx < STAGES.length - 1 && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-0.5 ${
                    isCompleted ? 'bg-campus-600' : 'bg-slate-200'
                  }`}
                />
              )}

              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 z-10 ${
                  isCompleted
                    ? 'bg-campus-600 border-campus-600 text-white'
                    : isCurrent
                    ? 'bg-white border-campus-600 text-campus-600 ring-2 ring-campus-100'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <CircleDot className="w-4 h-4 animate-pulse" />
                ) : (
                  <span className="text-xs">{idx + 1}</span>
                )}
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center justify-between">
                  <p
                    className={`text-sm font-semibold ${
                      isCurrent
                        ? 'text-campus-700'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {stage}
                  </p>
                  {historyEntry && historyEntry.changedAt && (
                    <span className="text-xs text-slate-400">
                      {new Date(historyEntry.changedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {historyEntry && historyEntry.comment && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {historyEntry.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
