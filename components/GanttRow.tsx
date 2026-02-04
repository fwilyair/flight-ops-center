import React from 'react';
import { Flight, TimelineEvent, Annotation, FlightType } from '../types';
import { timeToPixels, getColorForEventType } from '../utils';

interface GanttRowProps {
    flight: Flight;
}

const FlightStatusBadge = ({ status, type = 'ARR' }: { status: string; type?: 'ARR' | 'DEP' }) => {
    // 统一基础样式：固定高度、圆角、字体大小、边框
    const baseStyle = "h-[22px] min-w-[32px] px-1.5 flex items-center justify-center rounded text-[11px] font-bold tracking-wide whitespace-nowrap border";

    let colorStyle = '';
    // 根据是进港还是出港，统一色调
    if (status === '延误') {
        colorStyle = 'bg-red-50 text-red-700 border-red-100';
    } else if (type === 'ARR') {
        colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-100';
    } else {
        colorStyle = 'bg-blue-50 text-blue-700 border-blue-100';
    }

    return <span className={`${baseStyle} ${colorStyle}`}>{status}</span>;
};

const FlightTypeBadge = ({ type }: { type: FlightType }) => {
    const map: Record<FlightType, { label: string; style: string }> = {
        'REG': { label: '正班', style: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
        'CARGO': { label: '货班', style: 'bg-purple-50 text-purple-700 border-purple-100' },
        'EXTRA': { label: '加班', style: 'bg-orange-50 text-orange-700 border-orange-100' },
        'FERRY': { label: '调机', style: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
        'DIV': { label: '备降', style: 'bg-rose-50 text-rose-700 border-rose-100' },
    };

    const config = map[type] || map['REG'];

    return (
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border whitespace-nowrap ${config.style}`}>
            {config.label}
        </span>
    );
};

const EventPill: React.FC<{ event: TimelineEvent; track: number }> = ({ event, track }) => {
    const leftPos = timeToPixels(event.timeScheduled || event.timeActual || '');
    const colors = getColorForEventType(event.type, event.status);
    const isDelayed = event.status === 'delayed';

    // 根据轨道索引计算垂直位置，每个轨道高度30px（22px胶囊 + 8px间距）
    const topPos = 4 + (track * 30);

    return (
        <div
            className={`absolute flex items-center z-10 hover:z-20 transition-all cursor-pointer select-none group`}
            style={{ left: `${leftPos}px`, top: `${topPos}px` }}
        >
            {/* 对齐时间刻度的圆点 (中心对齐 leftPos) - 尺寸增大 - 统一绿色 */}
            <div className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 shadow-sm`}></div>

            {/* 胶囊主体 - 向右偏移增加，适配更大的圆点 */}
            <div className={`ml-4 flex items-stretch rounded-lg shadow-sm hover:shadow-lg overflow-hidden border ${colors.border} ${isDelayed ? 'animate-pulse' : ''}`}>
                {/* 主标签部分 - 彩色背景 */}
                <div className={`flex items-center px-2 py-[2px] ${colors.bg}`}>
                    <span className="text-sm font-bold text-white leading-none tracking-tight">
                        {event.label}
                    </span>
                </div>

                {/* 时间部分 - 浅色背景 */}
                <div className={`flex items-center gap-1.5 px-2 py-[2px] ${colors.lightBg}`}>
                    <div className="flex items-center gap-1 leading-none">
                        <span className="px-1 py-[1px] rounded-[2px] bg-blue-600 text-white text-xs font-bold transform scale-95 origin-center">计</span>
                        <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeScheduled || '--:--'}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                    <div className="flex items-center gap-1 leading-none">
                        <span className="px-1 py-[1px] rounded-[2px] bg-green-600 text-white text-xs font-bold transform scale-95 origin-center">实</span>
                        <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeActual}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 计算事件的轨道分配，避免重叠
const calculateEventTracks = (events: TimelineEvent[]): Map<string, number> => {
    const tracks = new Map<string, number>();
    const trackEndTimes: number[] = []; // 每个轨道的结束时间（像素）

    // 按开始时间排序
    const sortedEvents = [...events].sort((a, b) => {
        const aTime = timeToPixels(a.timeScheduled || a.timeActual || '');
        const bTime = timeToPixels(b.timeScheduled || b.timeActual || '');
        return aTime - bTime;
    });

    sortedEvents.forEach(event => {
        const startPx = timeToPixels(event.timeScheduled || event.timeActual || '');
        // 新设计的胶囊宽度：标签 + 时间部分
        const labelLength = event.label.length;
        // 修正：text-sm font-bold 每个汉字约16-18px，加上padding
        const labelWidth = labelLength * 18 + 24;
        const timeWidth = 190; // 时间部分固定宽度（适配 text-sm 大字体 + padding）
        const eventWidth = labelWidth + timeWidth + 10; // 额外加 10px buffer 防止边缘重叠
        const endPx = startPx + eventWidth;

        // 找到第一个可用的轨道
        let assignedTrack = 0;
        for (let i = 0; i < trackEndTimes.length; i++) {
            if (trackEndTimes[i] <= startPx) {
                assignedTrack = i;
                trackEndTimes[i] = endPx;
                break;
            }
        }

        // 如果没有找到可用轨道，创建新轨道
        if (assignedTrack === trackEndTimes.length || trackEndTimes[assignedTrack] > startPx) {
            assignedTrack = trackEndTimes.length;
            trackEndTimes.push(endPx);
        }

        tracks.set(event.id, assignedTrack);
    });

    return tracks;
};

const TimelineAnnotation: React.FC<{ annotation: Annotation; index: number }> = ({ annotation, index }) => {
    if (!annotation.startTime || !annotation.endTime) return null;

    const startPx = timeToPixels(annotation.startTime);
    const endPx = timeToPixels(annotation.endTime);
    const width = endPx - startPx;
    const centerPx = startPx + width / 2;

    // Position at bottom of row (stacked for multiple annotations)
    // 底部起始偏移 21px（标签距底8px），基线间距 34px（标签间距8px）
    const bottomOffset = 21 + (index * 34);

    // 估算文字宽度（每个字符约16px，加上更宽的padding）
    const labelWidth = annotation.label ? annotation.label.length * 16 + 24 : 0;
    const leftLineWidth = (width - labelWidth) / 2;
    const rightLineWidth = (width - labelWidth) / 2;

    // 统一的基线样式 - 所有基线使用完全相同的颜色
    const lineColor = '#9CA3AF'; // Tailwind gray-400

    return (
        <div
            className="absolute left-0 w-full flex items-center pointer-events-none"
            style={{ bottom: `${bottomOffset}px` }}
        >
            {/* Left Line Segment */}
            {leftLineWidth > 10 && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${startPx}px`,
                        width: `${leftLineWidth}px`,
                        height: '3px',
                        backgroundColor: lineColor,
                        borderRadius: '1.5px'
                    }}
                ></div>
            )}

            {/* The Label (Centered) with background */}
            {annotation.label && (
                <div
                    className="absolute -translate-x-1/2 flex items-center justify-center z-10"
                    style={{ left: `${centerPx}px` }}
                >
                    <span
                        className="text-sm font-bold px-2 py-0.5 rounded-md leading-none shadow-sm"
                        style={{
                            color: '#4B5563', // gray-600
                            backgroundColor: '#F3F4F6', // gray-100
                            border: '1px solid #E5E7EB' // gray-200
                        }}
                    >
                        {annotation.label}
                    </span>
                </div>
            )}

            {/* Right Line Segment */}
            {rightLineWidth > 10 && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${centerPx + labelWidth / 2}px`,
                        width: `${rightLineWidth}px`,
                        height: '3px',
                        backgroundColor: lineColor,
                        borderRadius: '1.5px'
                    }}
                ></div>
            )}

            {/* The Time (At Tail) - vertically centered with the line */}
            <div className="absolute" style={{ left: `${endPx + 6}px`, transform: 'translateY(-50%)', top: '50%' }}>
                <span
                    className="text-sm font-mono font-bold leading-none tabular-nums px-2 py-0.5 rounded-md shadow-sm"
                    style={{
                        color: '#4B5563', // gray-600
                        backgroundColor: '#F3F4F6', // gray-100
                        border: '1px solid #E5E7EB' // gray-200
                    }}
                >
                    {annotation.endTime}
                </span>
            </div>
        </div>
    );
};

export const GanttRow: React.FC<GanttRowProps> = ({ flight }) => {
    const isDelay = flight.arrInfo?.status === '延误' || flight.depInfo?.status === '延误';

    // 计算事件的轨道分配
    const eventTracks = calculateEventTracks(flight.events);
    const maxTrack = Math.max(0, ...Array.from(eventTracks.values()));
    const trackCount = maxTrack + 1;

    // 计算基线区域高度
    const annotationCount = flight.annotations?.length || 0;

    // Calculate row height based on tracks
    // Base height needs to be taller to accommodate the 6px border-bottom and padding
    const minHeight = 102;
    const rowHeight = Math.max(minHeight, (trackCount * 30) + (annotationCount * 34) + 10);

    return (
        <div
            className="flex group transition-all duration-200 relative mb-3 rounded-xl shadow-sm hover:shadow-md border border-slate-100"
            style={{
                height: `${rowHeight}px`,
                background: '#ffffff' // Pure white card background
            }}
        >

            <div
                className={`sticky left-0 w-[260px] min-w-[260px] px-4 py-2 flex flex-col justify-center gap-1 z-40 transition-all duration-300 group-hover:z-50 rounded-l-xl rounded-r-2xl mr-2 relative overflow-hidden group-hover:scale-[1.02] group-hover:shadow-lg origin-left`}
                style={{
                    background: '#f3f4f6',
                    borderRight: '1px solid #e5e7eb',
                    borderTop: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '4px 0 12px -2px rgba(0, 0, 0, 0.08)'
                }}
            >
                {/* Airline Code Watermark */}
                <div
                    className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden"
                >
                    <div
                        className="text-[9rem] italic font-black text-slate-900/[0.04] dark:text-white/[0.04] select-none leading-none transform -rotate-10 scale-125 origin-center blur-[1px]"
                        style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                    >
                        {flight.flightNo.substring(0, 2)}
                    </div>
                </div>

                {/* Content Wrapper */}
                <div className="relative z-10 w-full flex flex-col gap-1">
                    {/* Unified Flight Info Row */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex gap-1.5">
                            {/* Primary Column */}
                            <div className="flex flex-col gap-1">
                                <span className={`text-2xl font-bold leading-none tracking-tight font-mono ${flight.arrInfo ? 'text-emerald-700' : 'text-blue-600'}`}>
                                    {flight.flightNo.split(" / ")[0]}
                                </span>

                                {/* Primary Status Info */}
                                <div className="flex items-center gap-1 min-h-[22px]">
                                    {(flight.arrInfo || (!flight.arrInfo && flight.depInfo && !flight.codeshare) || (!flight.arrInfo && flight.depInfo)) && (
                                        <>
                                            {/* Logic: If ARR, show ArrInfo. If DEP (and this is the main col), show DepInfo */}
                                            {flight.arrInfo ? (
                                                <>
                                                    <FlightStatusBadge status={flight.arrInfo.status} type="ARR" />
                                                    {flight.arrInfo.stand && (
                                                        <div className="h-[22px] min-w-[32px] px-1.5 flex items-center justify-center rounded bg-emerald-50 border border-emerald-100 shadow-sm">
                                                            <span className="text-[11px] font-bold text-emerald-700 tabular-nums">{flight.arrInfo.stand}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : flight.depInfo ? (
                                                <>
                                                    <FlightStatusBadge status={flight.depInfo.status} type="DEP" />
                                                    {flight.depInfo.gate && (
                                                        <div className="h-[22px] min-w-[32px] px-1.5 flex items-center justify-center rounded bg-blue-50 border border-blue-100 shadow-sm">
                                                            <span className="text-[11px] font-bold text-blue-700 tabular-nums">{flight.depInfo.gate}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : null}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Divider & Secondary Column (Codeshare / Outbound) */}
                            {flight.codeshare && (
                                <>
                                    <span className="text-gray-400 text-lg pt-[2px]">/</span>
                                    <div className="flex flex-col gap-1">
                                        <span className={`text-2xl font-bold leading-none tracking-tight font-mono ${flight.arrInfo && flight.depInfo ? 'text-blue-600' : 'text-gray-500'}`}>
                                            {flight.codeshare}
                                        </span>

                                        {/* Secondary Status Info (Only for Dual flights where 2nd col is Dep) */}
                                        <div className="flex items-center gap-1 min-h-[22px]">
                                            {flight.arrInfo && flight.depInfo && (
                                                <>
                                                    <FlightStatusBadge status={flight.depInfo.status} type="DEP" />
                                                    {flight.depInfo.gate && (
                                                        <div className="h-[22px] min-w-[32px] px-1.5 flex items-center justify-center rounded bg-blue-50 border border-blue-100 shadow-sm">
                                                            <span className="text-[11px] font-bold text-blue-700 tabular-nums">{flight.depInfo.gate}</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <FlightTypeBadge type={flight.flightType} />
                    </div>

                    {/* Row 3: COBT & Actions */}
                    <div className="flex items-center justify-between w-full mt-1.5">
                        {/* COBT Tag */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded px-1.5 py-0.5 border border-gray-100 dark:border-gray-800">
                            <div className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">COBT</div>
                            <div className="text-xs font-bold text-gray-700 dark:text-gray-300 tabular-nums font-mono">
                                {flight.times?.cobt || '--:--'}
                            </div>
                        </div>

                        {/* Video Play Button */}
                        <button
                            className="flex items-center justify-center size-6 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            title="播放监控视频"
                        >
                            <span className="material-symbols-outlined text-[20px]">play_circle</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Content: Timeline */}
            <div className="flex-1 relative gantt-grid-bg">
                {flight.annotations?.map((anno, idx) => (
                    <TimelineAnnotation key={`anno-${idx}`} annotation={anno} index={idx} />
                ))}
                {flight.events.map((event) => (
                    <EventPill key={event.id} event={event} track={eventTracks.get(event.id) || 0} />
                ))}
            </div>
        </div >
    );
};
