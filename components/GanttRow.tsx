import React from 'react';
import { Flight, TimelineEvent, Annotation, FlightType, ProcessMarker } from '../types';
import { timeToPixels, getColorForEventType } from '../utils';

interface GanttRowProps {
    flight: Flight;
    timeScale: number;
    currentTime?: string;
    onClick?: () => void;
    onEventClick?: (event: TimelineEvent) => void;
    onVideoClick?: () => void;
}

const tagColorMap: Record<string, string> = {
    '冰': 'bg-blue-500',
    'Q': 'bg-blue-600',
    '控': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-red-500',
    'I': 'bg-purple-500',
    'D': 'bg-orange-500',
    'V': 'bg-teal-500',
    '互天': 'bg-cyan-600',
    '机': 'bg-indigo-500',
    '重要': 'bg-rose-600',
};

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
        'REG': { label: '正班', style: 'text-indigo-600' },
        'CARGO': { label: '货班', style: 'text-purple-600' },
        'EXTRA': { label: '加班', style: 'text-orange-600' },
        'FERRY': { label: '调机', style: 'text-cyan-600' },
        'DIV': { label: '备降', style: 'text-rose-600' },
    };

    const config = map[type] || map['REG'];

    return (
        <span className={`text-base font-bold whitespace-nowrap ${config.style} tracking-tight`}>
            {config.label}
        </span>
    );
};

// CalcPointWithTooltip: renders a purple calculated scale point with hover tooltip
const CalcPointWithTooltip: React.FC<{
    calcRelPx: number;
    calcPointTime: string;
    calcColor: string;
    dotVerticalOffset: number;
    isInsideCapsule: boolean;
    lineStartX: number;
    lineWidth: number;
    absoluteTop?: number;
}> = ({ calcRelPx, calcPointTime, calcColor, absoluteTop }) => {
    const [isCalcDotHovered, setIsCalcDotHovered] = React.useState(false);

    return (
        <>
            {/* Purple dot - fixed position above all tracks */}
            <div
                className="absolute flex items-center justify-center pointer-events-auto"
                style={{
                    left: `${calcRelPx}px`,
                    top: absoluteTop !== undefined ? `${absoluteTop}px` : `calc(50% + 0px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 50,
                }}
                onMouseEnter={() => setIsCalcDotHovered(true)}
                onMouseLeave={() => setIsCalcDotHovered(false)}
            >
                <div
                    className="size-3.5 rounded-full shadow-md"
                    style={{
                        backgroundColor: calcColor,
                        border: `2.5px solid white`,
                        boxShadow: `0 0 0 1.5px ${calcColor}50, 0 2px 4px rgba(0,0,0,0.15)`,
                    }}
                />
                {/* Hover tooltip - same style as process marker tooltip */}
                {isCalcDotHovered && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-[50px]">
                            <span className="text-base font-bold text-gray-900 font-mono tracking-tighter leading-none">
                                {calcPointTime}
                            </span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const EventPill: React.FC<{ event: TimelineEvent; track: number; timeScale: number; currentTime?: string; onEventClick?: (event: TimelineEvent) => void; trackSpacing?: number }> = ({ event, track, timeScale, currentTime, onEventClick, trackSpacing = 30 }) => {
    const leftPos = timeToPixels(event.timeScheduled || event.timeActual || '', timeScale);
    const colors = getColorForEventType(event.type, event.status);
    const isDelayed = event.status === 'delayed';

    let timeDiff: number | null = null;
    let timeDiffColor = '';
    const hasActualTime = event.timeActual && event.timeActual !== '--:--';
    if (!hasActualTime && event.timeScheduled && event.timeScheduled !== '--:--' && currentTime) {
        const [cH, cM] = currentTime.split(':').map(Number);
        const [sH, sM] = event.timeScheduled.split(':').map(Number);
        let diffMins = (cH * 60 + cM) - (sH * 60 + sM);
        if (diffMins > 720) diffMins -= 1440;
        if (diffMins < -720) diffMins += 1440;
        timeDiff = diffMins;
        timeDiffColor = diffMins > 0 ? 'text-red-500' : diffMins < 0 ? 'text-emerald-500' : 'text-gray-500';
    }

    // 根据轨道索引计算垂直位置，每个轨道高度30px（22px胶囊 + 8px间距）
    const topPos = 4 + (track * trackSpacing);

    const [isGreenDotHovered, setIsGreenDotHovered] = React.useState(false);

    return (
        <div
            className={`absolute flex items-center z-10 hover:z-20 transition-all duration-200 cursor-pointer select-none group hover:scale-105 overflow-visible`}
            style={{ left: `${leftPos}px`, top: `${topPos}px` }}
            onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
            }}
        >
            {/* 对齐时间刻度的圆点 (中心对齐 leftPos) - 尺寸增大 - 统一绿色 */}
            <div
                className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 shadow-sm z-30 pointer-events-auto`}
                onMouseEnter={() => setIsGreenDotHovered(true)}
                onMouseLeave={() => setIsGreenDotHovered(false)}
            >
                {/* Green dot hover tooltip */}
                {isGreenDotHovered && event.timeScheduled && event.timeScheduled !== '--:--' && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-[50px]">
                            <span className="text-base font-bold text-gray-900 font-mono tracking-tighter leading-none">
                                {event.timeScheduled}
                            </span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
                        </div>
                    </div>
                )}
            </div>

            <div className={`ml-4 flex items-stretch rounded-full shadow-sm hover:shadow-lg overflow-hidden border ${colors.border} ${isDelayed ? 'animate-pulse' : ''}`}>
                {/* 主标签部分 - 彩色背景 */}
                <div className={`flex items-center px-2 py-[2px] ${colors.bg}`}>
                    <span className="text-sm font-bold text-white leading-none tracking-tight">
                        {event.label}
                    </span>
                </div>

                {/* 时间部分 - 浅色背景 */}
                <div className={`flex items-center gap-1.5 px-2 py-[2px] ${colors.lightBg}`}>
                    <div className="flex items-center gap-1 leading-none">
                        <span className="px-1 py-[1px] rounded bg-blue-600 text-white text-xs font-bold transform scale-95 origin-center">计</span>
                        <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeScheduled || '--:--'}</span>
                    </div>
                    {hasActualTime ? (
                        <>
                            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                            <div className="flex items-center gap-1 leading-none">
                                <span className="px-1 py-[1px] rounded bg-green-600 text-white text-xs font-bold transform scale-95 origin-center">实</span>
                                <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeActual}</span>
                            </div>
                        </>
                    ) : timeDiff !== null ? (
                        <>
                            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                            <div className="flex items-center gap-1 leading-none py-[1px] px-1">
                                <span className={`tabular-nums font-mono font-bold text-sm tracking-tight leading-none ${timeDiffColor}`}>
                                    {timeDiff > 0 ? `+${timeDiff}` : timeDiff}
                                </span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                            <div className="flex items-center gap-1 leading-none">
                                <span className="px-1 py-[1px] rounded bg-green-600 text-white text-xs font-bold transform scale-95 origin-center">实</span>
                                <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">--:--</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

// 计算事件的轨道分配，避免重叠
const calculateEventTracks = (events: TimelineEvent[], timeScale: number): Map<string, number> => {
    const tracks = new Map<string, number>();
    const trackEndTimes: number[] = []; // 每个轨道的结束时间（像素）

    // 按开始时间排序
    const sortedEvents = [...events].sort((a, b) => {
        const aTime = timeToPixels(a.timeScheduled || a.timeActual || '', timeScale);
        const bTime = timeToPixels(b.timeScheduled || b.timeActual || '', timeScale);
        return aTime - bTime;
    });

    sortedEvents.forEach(event => {
        const startPx = timeToPixels(event.timeScheduled || event.timeActual || '', timeScale);
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

const ProcessDiamond: React.FC<{
    marker: ProcessMarker;
    timeScale: number;
    stagger: number; // -1, 0, or 1
    isOverlappingLabel: boolean;
}> = ({ marker, timeScale, stagger, isOverlappingLabel }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const leftPx = timeToPixels(marker.time, timeScale);

    // Dynamic coloring based on phase
    const colors = marker.phase === 'arrival'
        ? { bg: 'bg-emerald-500/90', border: 'border-emerald-600', text: 'text-emerald-50' }
        : { bg: 'bg-blue-500/90', border: 'border-blue-600', text: 'text-blue-50' };

    // Prevent overlap logic: stagger vertically if close to others, and avoid label
    const staggerOffset = stagger * 14;
    let labelAvoidanceOffset = 0;
    if (isOverlappingLabel) {
        // If overlapping the label, push it further away based on stagger direction (or up if stagger is 0)
        labelAvoidanceOffset = stagger < 0 ? -18 : 18;
    }

    // Calculate final vertical translation
    const verticalOffset = staggerOffset + labelAvoidanceOffset;

    return (
        <div
            className="absolute flex items-center justify-center z-20 pointer-events-auto"
            style={{
                left: `${leftPx}px`,
                top: 0,
                transform: `translate(-50%, calc(-50% + ${-verticalOffset}px))`,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`relative flex items-center justify-center w-[18px] h-[18px] border shadow-sm transition-transform duration-200 hover:scale-110 cursor-default ${colors.bg} ${colors.border}`}
                style={{ transform: 'rotate(45deg)' }}
            >
                <span
                    className={`text-[10px] font-bold leading-none ${colors.text} select-none`}
                    style={{ transform: 'rotate(-45deg)', display: 'block' }}
                >
                    {marker.label[0]}
                </span>
            </div>

            {/* Hover Tooltip */}
            {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in duration-200">
                    <div className="bg-white px-2 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-[64px]">
                        <span className="text-base font-bold text-gray-900 font-mono tracking-tighter leading-none mb-1">
                            {marker.time}
                        </span>
                        <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap leading-none tracking-widest">
                            {marker.label}
                        </span>
                        {/* Little triangle pointer */}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
                    </div>
                </div>
            )}
        </div>
    );
};


const AnnotationLine: React.FC<{ annotation: Annotation; index: number; timeScale: number }> = ({ annotation, index, timeScale }) => {
    if (!annotation.startTime || !annotation.endTime) return null;

    const startPx = timeToPixels(annotation.startTime, timeScale);
    const endPx = timeToPixels(annotation.endTime, timeScale);
    const width = endPx - startPx;
    const centerPx = startPx + width / 2;

    // Position at bottom of row (stacked for multiple annotations)
    // 底部起始偏移 21px（标签距底8px），基线间距 34px（标签间距8px）
    const bottomOffset = 21 + (index * 34);

    // 估算文字宽度（每个字符约16px，加上更宽的padding）
    const labelWidth = annotation.label ? annotation.label.length * 16 + 24 : 0;
    const leftLineWidth = (width - labelWidth) / 2;
    const rightLineWidth = (width - labelWidth) / 2;

    // Pre-calculate marker overlaps
    const processedMarkers = React.useMemo(() => {
        if (!annotation.markers || annotation.markers.length === 0) return [];

        // Sort by time
        const sorted = [...annotation.markers].sort((a, b) => a.time.localeCompare(b.time));

        return sorted.map((marker, i, arr) => {
            const px = timeToPixels(marker.time, timeScale);
            // Check label overlap
            const isOverlappingLabel = annotation.label
                ? (px > centerPx - labelWidth / 2 - 10 && px < centerPx + labelWidth / 2 + 10)
                : false;

            return {
                ...marker,
                isOverlappingLabel
            };
        });
    }, [annotation.markers, annotation.label, centerPx, labelWidth, timeScale]);

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
            <div className="absolute" style={{ left: `${endPx + 6}px`, transform: 'translateY(-50%)', top: '0' }}>
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

            {/* Process Markers */}
            {processedMarkers.map((m, i, arr) => {
                // Determine stagger: if close to previous, alternate.
                let stagger = 0;
                if (i > 0) {
                    const prevPx = timeToPixels(arr[i - 1].time, timeScale);
                    const currPx = timeToPixels(m.time, timeScale);
                    if (currPx - prevPx < 28) {
                        stagger = i % 2 === 1 ? 1 : -1;
                    }
                } else if (i < arr.length - 1) {
                    const nextPx = timeToPixels(arr[i + 1].time, timeScale);
                    const currPx = timeToPixels(m.time, timeScale);
                    if (nextPx - currPx < 28) {
                        stagger = -1; // Give the first one a stagger if it overlaps the second
                    }
                }

                return (
                    <ProcessDiamond
                        key={m.id}
                        marker={m}
                        timeScale={timeScale}
                        stagger={stagger}
                        isOverlappingLabel={m.isOverlappingLabel}
                    />
                );
            })}
        </div>
    );
};

const FusedInfoBadge = ({ label, value, type = 'ARR', status }: { label: string; value: string; type?: 'ARR' | 'DEP'; status?: string }) => {
    let bgDark = 'bg-gray-600';
    let bgLight = 'bg-gray-100';
    let textDark = 'text-white';
    let textLight = 'text-gray-900';
    let border = 'border-gray-200';

    if (status === '延误') {
        bgDark = 'bg-red-600';
        bgLight = 'bg-red-50';
        textLight = 'text-red-900';
        border = 'border-red-100';
    } else if (type === 'ARR') {
        bgDark = 'bg-emerald-600';
        bgLight = 'bg-emerald-50';
        textLight = 'text-emerald-900';
        border = 'border-emerald-100';
    } else {
        bgDark = 'bg-blue-600';
        bgLight = 'bg-blue-50';
        textLight = 'text-blue-900';
        border = 'border-blue-100';
    }

    return (
        <div className={`flex items-center rounded-full overflow-hidden shadow-sm border ${border} h-[26px]`}>
            <div className={`${bgDark} ${textDark} px-2 h-full flex items-center justify-center text-xs font-bold tracking-wide whitespace-nowrap`}>
                {label}
            </div>
            <div className={`${bgLight} ${textLight} px-2 h-full flex items-center justify-center text-sm font-bold tabular-nums`}>
                {value}
            </div>
        </div>
    );
};

export const GanttRow: React.FC<GanttRowProps> = ({ flight, timeScale, currentTime, onClick, onEventClick, onVideoClick }) => {
    const isDelay = flight.arrInfo?.status === '延误' || flight.depInfo?.status === '延误';

    // 计算事件的轨道分配
    const eventTracks = calculateEventTracks(flight.events, timeScale);
    const maxTrack = Math.max(0, ...Array.from(eventTracks.values()));
    const trackCount = maxTrack + 1;

    // 判断是否有计算刻度点（需要更大的轨道间距来容纳紫色圆点）
    const releaseAnno = flight.annotations?.find(a => a.label === '放行');
    const takeoffAnno = flight.annotations?.find(a => a.label === '起飞');
    let hasCalcPoints = false;
    if (releaseAnno?.endTime && takeoffAnno?.endTime) {
        const [rH, rM] = releaseAnno.endTime.split(':').map(Number);
        const [tH, tM] = takeoffAnno.endTime.split(':').map(Number);
        const diff = (rH * 60 + rM) - (tH * 60 + tM);
        hasCalcPoints = diff >= 0 && diff <= 15;
    }
    const trackSpacing = hasCalcPoints ? 48 : 30;

    // 计算基线区域高度
    const annotationCount = flight.annotations?.length || 0;

    // Calculate row height based on tracks
    // Base height needs to be taller to accommodate the 6px border-bottom and padding + new tag row
    const minHeight = 130;
    const rowHeight = Math.max(minHeight, (trackCount * trackSpacing) + (annotationCount * 34) + 10);

    return (
        <div
            className="flex group transition-all duration-200 relative mb-3 rounded-xl shadow-sm hover:shadow-md border border-slate-100"
            style={{
                height: `${rowHeight}px`,
                background: '#ffffff' // Pure white card background
            }}
        >

            <div
                className={`sticky left-0 w-[260px] min-w-[260px] px-4 py-2 flex flex-col justify-center gap-1 z-40 transition-all duration-300 group-hover:z-50 rounded-l-xl rounded-r-2xl mr-2 relative group-hover:scale-[1.02] group-hover:shadow-lg origin-left cursor-pointer`}
                style={{
                    background: '#f3f4f6',
                    borderRight: '1px solid #e5e7eb',
                    borderTop: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb',
                    boxShadow: '4px 0 12px -2px rgba(0, 0, 0, 0.08)'
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
            >
                {/* Airline Code Watermark */}
                <div
                    className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden rounded-l-xl rounded-r-2xl"
                >
                    <div
                        className="text-[9rem] italic font-black text-slate-900/[0.04] dark:text-white/[0.04] select-none leading-none transform -rotate-10 scale-125 origin-center blur-[1px]"
                        style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                    >
                        {flight.flightNo.substring(0, 2)}
                    </div>
                </div>

                {/* Video Play Button (Absolute Top-Right) */}



                {/* Content Wrapper */}
                <div className="relative z-10 w-full flex flex-col gap-2">
                    {/* Row 1: Flight Numbers + Play Button */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex items-center">
                            <span className={`text-2xl font-bold leading-none tracking-tight font-mono tabular-nums ${flight.arrInfo ? 'text-emerald-700' : 'text-blue-600'}`}>
                                {flight.flightNo.split(" / ")[0]}
                            </span>

                            {flight.codeshare && (
                                <>
                                    <div className="flex flex-none justify-center w-5 min-w-[20px] text-gray-400 text-xl leading-none font-light">/</div>
                                    <span className={`text-2xl font-bold leading-none tracking-tight font-mono tabular-nums ${flight.arrInfo && flight.depInfo ? 'text-blue-600' : 'text-gray-500'}`}>
                                        {flight.codeshare}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Video Play Button */}
                        <button
                            className="flex items-center justify-center size-8 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 -mt-1 hover:scale-110 hover:shadow-md"
                            title="播放监控视频"
                            onClick={(e) => {
                                e.stopPropagation();
                                onVideoClick?.();
                            }}
                        >
                            <span className="material-symbols-outlined text-[26px]">play_circle</span>
                        </button>
                    </div>

                    {/* Row 2: Status Badges (跨整个宽度，与播放按钮右对齐) */}
                    <div className="flex items-center justify-between w-full">
                        {/* Primary Status Info */}
                        <div className="w-fit">
                            {(flight.arrInfo || (!flight.arrInfo && flight.depInfo && !flight.codeshare) || (!flight.arrInfo && flight.depInfo)) && (
                                <>
                                    {flight.arrInfo ? (
                                        <FusedInfoBadge
                                            label={flight.arrInfo.status}
                                            value={flight.arrInfo.stand || '-'}
                                            type="ARR"
                                            status={flight.arrInfo.status}
                                        />
                                    ) : flight.depInfo ? (
                                        <FusedInfoBadge
                                            label={flight.depInfo.status}
                                            value={flight.depInfo.gate || '-'}
                                            type="DEP"
                                            status={flight.depInfo.status}
                                        />
                                    ) : null}
                                </>
                            )}
                        </div>

                        {/* Secondary Status Info (Only for Dual flights) */}
                        {flight.codeshare && flight.arrInfo && flight.depInfo && (
                            <div className="w-fit">
                                <FusedInfoBadge
                                    label={flight.depInfo.status}
                                    value={flight.depInfo.gate || '-'}
                                    type="DEP"
                                    status={flight.depInfo.status}
                                />
                            </div>
                        )}
                    </div>

                    {/* Row 3: COBT & Actions */}
                    <div className="flex items-center justify-between w-full">
                        {/* COBT Tag */}
                        <div className="flex items-baseline gap-2">
                            <div className="text-base font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider leading-none italic">COBT</div>
                            <div className="text-sm font-bold text-gray-700 dark:text-gray-300 tabular-nums font-mono italic leading-none">
                                {flight.times?.cobt ? `${flight.times.cobt}(05)` : '--:--'}
                            </div>
                        </div>

                        {/* Flight Type Badge (Moved from Row 2) */}
                        <FlightTypeBadge type={flight.flightType} />
                    </div>

                    {/* Row 4: Flight Tags */}
                    {flight.tags && flight.tags.length > 0 && (
                        <div className="relative group/tags w-full mt-1">
                            {/* Tags Container (Fixed height, truncating explicitly) */}
                            <div className="flex items-center gap-1 w-full h-[22px]">
                                {(() => {
                                    const MAX_VISIBLE = 10;
                                    const hasMore = flight.tags.length > MAX_VISIBLE;
                                    const displayTags = hasMore ? [...flight.tags.slice(0, 9), '...'] : flight.tags;

                                    return displayTags.map((tag, idx) => {
                                        const isMore = tag === '...';
                                        const isDualChar = tag.length > 1 && !isMore;
                                        const colorClass = isMore
                                            ? 'bg-slate-300 text-slate-700 outline outline-[1.5px] outline-slate-200 outline-offset-[-1.5px]'
                                            : (tagColorMap[tag] || 'bg-gray-400');
                                        const textStyle = (tag === '控' || isMore) ? '' : 'text-white';

                                        return (
                                            <div
                                                key={`tag-${idx}`}
                                                className={`flex-shrink-0 flex items-center justify-center size-[19px] rounded-full font-bold cursor-default shadow-sm ${colorClass} ${textStyle}`}
                                                title={isMore ? `还有 ${flight.tags.length - 9} 个标记` : tag}
                                            >
                                                <span
                                                    className={`font-bold leading-none ${isMore ? 'text-[10px] tracking-widest pl-[1px] mb-[2px]' : isDualChar ? 'text-[9px] tracking-tighter' : 'text-[11px]'}`}
                                                    style={{ transform: isDualChar ? 'scale(0.95)' : 'none' }}
                                                >
                                                    {tag}
                                                </span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Hover Tooltip (Absolute positioned to escape overflow if hovered) */}
                            <div className="absolute top-[26px] left-0 z-[100] hidden group-hover/tags:flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-white px-2.5 py-2 rounded-lg shadow-xl border border-gray-100 min-w-max">
                                    <div className="text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">航班标记</div>
                                    <div className="flex items-center gap-1 flex-wrap max-w-[200px]">
                                        {flight.tags.map((tag, idx) => {
                                            const isDualChar = tag.length > 1;
                                            const colorClass = tagColorMap[tag] || 'bg-gray-400';
                                            return (
                                                <div
                                                    key={`hover-tag-${idx}`}
                                                    className={`flex items-center justify-center size-[24px] rounded-full text-white font-bold shadow-sm ${colorClass}`}
                                                >
                                                    <span
                                                        className={`font-bold leading-none ${isDualChar ? 'text-[10px] tracking-tighter' : 'text-xs'}`}
                                                    >
                                                        {tag}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {/* Triangle pointer */}
                                    <div className="absolute -top-[5px] left-3 w-2.5 h-2.5 bg-white border-t border-l border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Content: Timeline */}
            <div className="flex-1 relative gantt-grid-bg" style={{ overflow: 'visible' }}>
                {flight.annotations?.map((anno, idx) => (
                    <AnnotationLine key={`anno-${idx}`} annotation={anno} index={idx} timeScale={timeScale} />
                ))}
                {flight.events.map((event) => (
                    <EventPill
                        key={event.id}
                        event={event}
                        track={eventTracks.get(event.id) || 0}
                        timeScale={timeScale}
                        currentTime={currentTime}
                        onEventClick={onEventClick}
                        trackSpacing={trackSpacing}
                    />
                ))}

                {/* Calculated Scale Points - rendered as separate layer ABOVE all capsules */}
                {(() => {
                    const releaseAnno = flight.annotations?.find(a => a.label === '放行');
                    const takeoffAnno = flight.annotations?.find(a => a.label === '起飞');
                    if (!releaseAnno?.endTime || !takeoffAnno?.endTime) return null;
                    const [rH, rM] = releaseAnno.endTime.split(':').map(Number);
                    const [tH, tM] = takeoffAnno.endTime.split(':').map(Number);
                    const diff = (rH * 60 + rM) - (tH * 60 + tM);
                    if (diff < 0 || diff > 15) return null;

                    const calcColor = '#A78BFA';

                    return flight.events.map((event) => {
                        if (!event.timeScheduled || event.timeScheduled === '--:--') return null;
                        const [eH, eM] = event.timeScheduled.split(':').map(Number);
                        const totalMin = eH * 60 + eM + diff;
                        const cH = Math.floor(totalMin / 60) % 24;
                        const cM = totalMin % 60;
                        const calcPointTime = `${String(cH).padStart(2, '0')}:${String(cM).padStart(2, '0')}`;

                        const track = eventTracks.get(event.id) || 0;
                        const capsuleTopY = 4 + track * trackSpacing; // top of capsule
                        const greenDotPx = timeToPixels(event.timeScheduled, timeScale);
                        const purpleDotPx = timeToPixels(calcPointTime, timeScale);
                        const greenDotY = capsuleTopY + 11; // center of capsule
                        const purpleDotY = capsuleTopY - 10; // above the capsule

                        return (
                            <React.Fragment key={`calc-${event.id}`}>
                                {/* L-shaped dashed line: green dot → up → horizontal → purple dot */}
                                {/* Vertical segment: from green dot center UP to purple dot level */}
                                <div
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: `${greenDotPx}px`,
                                        top: `${purpleDotY}px`,
                                        width: '2px',
                                        height: `${greenDotY - purpleDotY}px`,
                                        borderLeft: `2px dashed ${calcColor}`,
                                        opacity: 0.6,
                                        transform: 'translateX(-50%)',
                                        zIndex: 45,
                                    }}
                                />
                                {/* Horizontal segment: from green dot X to purple dot X, at purple dot level */}
                                <div
                                    className="absolute pointer-events-none"
                                    style={{
                                        left: `${Math.min(greenDotPx, purpleDotPx)}px`,
                                        top: `${purpleDotY}px`,
                                        width: `${Math.abs(purpleDotPx - greenDotPx)}px`,
                                        height: '2px',
                                        borderTop: `2px dashed ${calcColor}`,
                                        opacity: 0.6,
                                        transform: 'translateY(-50%)',
                                        zIndex: 45,
                                    }}
                                />
                                {/* Purple dot above its own capsule */}
                                <CalcPointWithTooltip
                                    calcRelPx={purpleDotPx}
                                    calcPointTime={calcPointTime}
                                    calcColor={calcColor}
                                    dotVerticalOffset={0}
                                    isInsideCapsule={false}
                                    lineStartX={0}
                                    lineWidth={0}
                                    absoluteTop={purpleDotY}
                                />
                            </React.Fragment>
                        );
                    });
                })()}
            </div>
        </div >
    );
};
