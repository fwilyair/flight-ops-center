import React from 'react';
import { InspectionEvent } from '../types';
import { timeToPixels } from '../utils';
import { getTimeDifferenceMinutes } from './flightRowLayout';
import { TimeKindBadge } from './TimeKindBadge';

export interface InspectionPillProps {
  inspection: InspectionEvent;
  timeScale: number;
  currentTime: string;
  flightId: string;
  track?: number;
  totalTracks?: number;
  trackSpacing?: number;
  onInspectionClick?: (inspection: InspectionEvent) => void;
  onInspectionComplete?: (inspectionId: string) => void;
}

export const InspectionPill: React.FC<InspectionPillProps> = ({
  inspection,
  timeScale,
  currentTime,
  flightId,
  track = 0,
  totalTracks = 1,
  trackSpacing = 30,
  onInspectionClick,
  onInspectionComplete,
}) => {
  const { status, type, timeScheduled, timeActual, operator } = inspection;
  const leftPos = timeToPixels(timeScheduled, timeScale);
  
  // 搭配 GanttRow 管控视图的极致压缩高度 (8 + trackCount * 30)，每轨 topPos 为 5 + t * 30
  // 使得 28px 胶囊顶部保留 5px 边距，底部同样留有 5px 边距，极其紧凑且保留极佳美感
  const getTrackTopPos = (t: number) => {
    return 5 + t * 30;
  };
  const topPos = getTrackTopPos(track);
  const [isGreenDotHovered, setIsGreenDotHovered] = React.useState(false);

  const isCompleted = status === 'completed' || status === 'overtime-completed';
  const isOvertimeIncomplete = status === 'overtime-incomplete';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInspectionClick?.(inspection);
  };

  // Time diff calculation for pending/incomplete inspections
  const timeDiffVal = getTimeDifferenceMinutes(currentTime, timeScheduled);
  const isOverdue = !isCompleted && timeDiffVal !== undefined && timeDiffVal > 0;

  // Time diff calculation for completed inspections (actual vs scheduled)
  const completedTimeDiff = (isCompleted && timeActual && timeActual !== '--:--' && timeScheduled && timeScheduled !== '--:--')
    ? getTimeDifferenceMinutes(timeActual, timeScheduled)
    : undefined;

  const isOvertimeCompleted = status === 'overtime-completed' || (isCompleted && completedTimeDiff !== undefined && completedTimeDiff > 0);

  // Color mapping matching EventPill
  let badgeBg = 'bg-emerald-600';
  let lightBg = 'bg-emerald-50 dark:bg-emerald-950/40';
  let borderStyle = 'border-emerald-600/30';
  let actualBadgeColor = 'bg-green-600';
  let badgeText = 'text-white';
  
  if (isOvertimeCompleted) {
    badgeBg = 'bg-amber-500';
    lightBg = 'bg-amber-50 dark:bg-amber-950/40';
    borderStyle = 'border-amber-500/40';
    actualBadgeColor = 'bg-amber-500';
  } else if (isOvertimeIncomplete) {
    badgeBg = 'bg-red-600';
    lightBg = 'bg-red-50 dark:bg-red-950/40';
    borderStyle = 'border-red-500/40';
  }

  const formatTimeDiff = (diff: number) => (diff > 0 ? `+${diff}` : `${diff}`);
  const getTimeDiffColor = (diff: number) => (diff > 0 ? 'text-red-500' : diff < 0 ? 'text-emerald-500' : 'text-gray-500');

  return (
    <div
      data-motion-layout
      data-flip-id={`inspection-${flightId}-${inspection.id}`}
      className="absolute flex items-center z-20 hover:z-[25] cursor-pointer select-none group overflow-visible"
      style={{ left: `${leftPos}px`, top: `${topPos}px` }}
      onClick={handleClick}
    >
      {/* Green Dot at Scheduled Time (Same as EventPill) */}
      <div
        className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 shadow-sm z-30 pointer-events-auto"
        onMouseEnter={() => setIsGreenDotHovered(true)}
        onMouseLeave={() => setIsGreenDotHovered(false)}
      >
        {isGreenDotHovered && timeScheduled && timeScheduled !== '--:--' && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <div className="bg-white px-2 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-[50px]">
              <span className="text-base font-bold text-gray-900 font-mono tracking-tighter leading-none">{timeScheduled}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Main Capsule Body with ml-4 gap from green dot */}
      <div className="relative ml-4">
        {isCompleted ? (
          /* 已操作：实心填充样式（超时完成显示黄色，按时完成显示绿色） */
          <div className={`flex items-stretch rounded-full shadow-sm hover:shadow-lg overflow-hidden border ${borderStyle} transition-all duration-200 group-hover:scale-[1.02]`}>
            {/* 左侧主要标签 */}
            <div className={`flex items-center px-2 py-[2px] ${badgeBg}`}>
              <span className={`text-sm font-bold leading-none tracking-tight ${badgeText}`}>
                {type}
              </span>
            </div>

            {/* 右侧实际时间部分（有实际时间后只显示实际时间） */}
            <div className={`flex items-center gap-1.5 px-2 py-[2px] ${lightBg}`}>
              <div className="flex items-center gap-1 leading-none">
                <TimeKindBadge kind="actual" colorClass={actualBadgeColor} />
                <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">
                  {timeActual}
                </span>
              </div>

              {completedTimeDiff !== undefined && completedTimeDiff > 0 && (
                <>
                  <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                  <div className="flex items-center gap-1 leading-none py-[1px] px-1">
                    <span className={`tabular-nums font-mono font-bold text-sm tracking-tight leading-none ${getTimeDiffColor(completedTimeDiff)}`}>
                      {formatTimeDiff(completedTimeDiff)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* 未操作：空心/描边样式（边框虚线，不带有√或○图标） */
          <div className={`flex items-stretch rounded-full shadow-sm hover:shadow-lg overflow-hidden border border-dashed transition-all duration-200 group-hover:scale-[1.02] ${
            isOverdue || isOvertimeIncomplete
              ? 'border-red-500 bg-red-50/20 dark:bg-red-950/10'
              : 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900'
          }`}>
            {/* 左侧主要标签 - 空心无背景 */}
            <div className="flex items-center px-2 py-[2px] border-r border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
              <span className={`text-sm font-bold leading-none tracking-tight ${
                isOverdue || isOvertimeIncomplete ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
              }`}>
                {type}
              </span>
            </div>

            {/* 右侧时间部分（未操作时不显示实际的 --:--） */}
            <div className="flex items-center gap-1.5 px-2 py-[2px] bg-white dark:bg-slate-900">
              <div className="flex items-center gap-1 leading-none">
                <TimeKindBadge kind="scheduled" />
                <span className="tabular-nums font-mono font-bold text-gray-800 dark:text-gray-200 text-sm leading-none">
                  {timeScheduled}
                </span>
              </div>

              {/* 超时提醒 Badge */}
              {isOverdue && timeDiffVal !== undefined && (
                <>
                  <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                  <div className="flex items-center gap-1 leading-none py-[1px] px-1">
                    <span className={`tabular-nums font-mono font-bold text-sm tracking-tight leading-none ${getTimeDiffColor(timeDiffVal)}`}>
                      {formatTimeDiff(timeDiffVal)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

