import React from 'react';
import { Flight, TimelineEvent, Annotation, FlightType, ProcessMarker } from '../types';
import { timeToPixels, getColorForEventType } from '../utils';
import { assignPriorityTracks, buildFixedRowOverflow, buildOverflowPreviewLayout, getCorrectedTime, getExpandedControlTop, getExpansionTargetEventId, getFlightRowHeight, getStateAfterExpansionChange, getTimeDifferenceMinutes } from './flightRowLayout';
import type { OverflowGroup } from './flightRowLayout';
import { TimeKindBadge } from './TimeKindBadge';

export interface EventHoverInfo {
    eventId: string;
    timeScheduled: string;
    calcPointTime?: string;
    greenDotPx: number;
    purpleDotPx?: number;
    greenDotY: number;
    purpleDotY?: number;
}

export interface GanttRowProps {
    flight: Flight;
    timeScale: number;
    currentTime?: string;
    expandAllRows?: boolean;
    onClick?: () => void;
    onEventClick?: (event: TimelineEvent) => void;
    onVideoClick?: () => void;
    onEventHover?: (info: EventHoverInfo | null) => void;
}

// 航班列表用高区分度配色容纳多个小标记；详情面板则保留独立的状态强调色。
const flightCardTagColorMap: Record<string, string> = {
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
    motionId: string;
    flightId: string;
    calcRelPx: number;
    calcPointTime: string;
    calcColor: string;
    dotVerticalOffset: number;
    isInsideCapsule: boolean;
    lineStartX: number;
    lineWidth: number;
    absoluteTop?: number;
    onHoverChange?: (isHovered: boolean) => void;
}> = ({ motionId, flightId, calcRelPx, calcPointTime, calcColor, absoluteTop, onHoverChange }) => {
    const [isCalcDotHovered, setIsCalcDotHovered] = React.useState(false);

    return (
        <>
            {/* Purple dot - fixed position above all tracks */}
            <div
                data-motion-layout
                data-flip-id={`calc-${flightId}-${motionId}`}
                className="absolute flex items-center justify-center pointer-events-auto"
                style={{
                    left: `${calcRelPx}px`,
                    top: absoluteTop !== undefined ? `${absoluteTop}px` : `calc(50% + 0px)`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 30,
                }}
                onMouseEnter={() => {
                    setIsCalcDotHovered(true);
                    onHoverChange?.(true);
                }}
                onMouseLeave={(e) => {
                    setIsCalcDotHovered(false);
                    if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
                        return;
                    }
                    onHoverChange?.(false);
                }}
            >
                <div
                    className="size-3.5 rounded-full shadow-md animate-[calcBreath_2s_ease-in-out_infinite]"
                    style={{
                        backgroundColor: calcColor,
                        border: `2.5px solid white`,
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

const EventCapsuleVisual: React.FC<{
    event: TimelineEvent;
    currentTime?: string;
}> = ({ event, currentTime }) => {
    const colors = getColorForEventType(event.type, event.status);
    const isDelayed = event.status === 'delayed';

    const hasActualTime = event.timeActual && event.timeActual !== '--:--';
    const pendingTimeDiff = !hasActualTime
        ? getTimeDifferenceMinutes(currentTime, event.timeScheduled)
        : undefined;
    const completedTimeDiff = hasActualTime && event.status === 'overtime-completed'
        ? getTimeDifferenceMinutes(event.timeActual, event.timeScheduled)
        : undefined;
    const getTimeDiffColor = (difference: number) => (
        difference > 0 ? 'text-red-500' : difference < 0 ? 'text-emerald-500' : 'text-gray-500'
    );
    const formatTimeDiff = (difference: number) => (
        difference > 0 ? `+${difference}` : difference
    );

    return (
        <div className="relative">
                {/* Capsule outline: 0=无框线, 1=虚线转动(已发管控), 2=渐变实线(已收回执) */}
                {(() => {
                    // 用 event.id 的字符码之和 mod 3 做稳定随机分配
                    const hash = event.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                    const outlineType = hash % 3;
                    if (outlineType === 1) {
                        // 已发送管控、未收回执: 橙黄虚线旋转
                        return (
                            <svg className="absolute inset-[-3px] pointer-events-none z-0" style={{ width: 'calc(100% + 6px)', height: 'calc(100% + 6px)' }}>
                                <rect x="1.5" y="1.5" rx="12" ry="12" fill="none"
                                    stroke="rgba(234, 160, 0, 0.85)" strokeWidth="2.5" strokeDasharray="14 12"
                                    style={{ width: 'calc(100% - 3px)', height: 'calc(100% - 3px)', animation: 'dashMarch 2s linear infinite' }} />
                            </svg>
                        );
                    } else if (outlineType === 2) {
                        // 已收到回执: 渐变实线 (方案C)
                        const gradId = `grad-${event.id}`;
                        return (
                            <svg className="absolute inset-[-3px] pointer-events-none z-0" style={{ width: 'calc(100% + 6px)', height: 'calc(100% + 6px)' }}>
                                <defs>
                                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#10B981" />
                                        <stop offset="100%" stopColor="#0891B2" />
                                    </linearGradient>
                                </defs>
                                <rect x="1.5" y="1.5" rx="12" ry="12" fill="none"
                                    stroke={`url(#${gradId})`} strokeWidth="2.5"
                                    style={{ width: 'calc(100% - 3px)', height: 'calc(100% - 3px)' }} />
                            </svg>
                        );
                    }
                    // outlineType === 0: 无框线
                    return null;
                })()}
                <div className={`flex items-stretch rounded-full shadow-sm hover:shadow-lg overflow-hidden ${isDelayed ? 'animate-pulse' : ''}`}>
                    {/* 主标签部分 - 彩色背景 */}
                    <div className={`flex items-center px-2 py-[2px] ${colors.bg}`}>
                        <span className="text-sm font-bold text-white leading-none tracking-tight">
                            {event.label}
                        </span>
                    </div>

                    {/* 时间部分 - 浅色背景 */}
                    <div className={`flex items-center gap-1.5 px-2 py-[2px] ${colors.lightBg}`}>
                        <div className="flex items-center gap-1 leading-none">
                            <TimeKindBadge kind="scheduled" />
                            <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeScheduled || '--:--'}</span>
                        </div>
                        {hasActualTime ? (
                            <>
                                <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                                <div className="flex items-center gap-1 leading-none">
                                    <TimeKindBadge kind="actual" />
                                    <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">{event.timeActual}</span>
                                </div>
                                {completedTimeDiff !== undefined && (
                                    <>
                                        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                                        <div className="flex items-center gap-1 leading-none py-[1px] px-1">
                                            <span className={`tabular-nums font-mono font-bold text-sm tracking-tight leading-none ${getTimeDiffColor(completedTimeDiff)}`}>
                                                {formatTimeDiff(completedTimeDiff)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </>
                        ) : pendingTimeDiff !== undefined ? (
                            <>
                                <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                                <div className="flex items-center gap-1 leading-none py-[1px] px-1">
                                    <span className={`tabular-nums font-mono font-bold text-sm tracking-tight leading-none ${getTimeDiffColor(pendingTimeDiff)}`}>
                                        {formatTimeDiff(pendingTimeDiff)}
                                    </span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-0.5 opacity-50"></div>
                                <div className="flex items-center gap-1 leading-none">
                                    <TimeKindBadge kind="actual" />
                                    <span className="tabular-nums font-mono font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">--:--</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
    );
};

const EventPill: React.FC<{
    event: TimelineEvent;
    flightId: string;
    track: number;
    timeScale: number;
    currentTime?: string;
    onEventClick?: (event: TimelineEvent) => void;
    onContextMenu?: (e: React.MouseEvent, event: TimelineEvent) => void;
    isDimmed?: boolean;
    trackSpacing?: number;
    onHoverChange?: (isHovered: boolean) => void;
}> = ({ event, flightId, track, timeScale, currentTime, onEventClick, onContextMenu, isDimmed, trackSpacing = 30, onHoverChange }) => {
    const leftPos = timeToPixels(event.timeScheduled || event.timeActual || '', timeScale);
    const topPadding = trackSpacing > 30 ? 22 : 4;
    const topPos = topPadding + (track * trackSpacing);
    const [isGreenDotHovered, setIsGreenDotHovered] = React.useState(false);

    return (
        <div
            data-motion-layout
            data-flip-id={`event-${flightId}-${event.id}`}
            className={`absolute flex items-center z-20 hover:z-[25] cursor-pointer select-none group overflow-visible ${isDimmed ? 'opacity-40 grayscale-[80%]' : ''}`}
            style={{ left: `${leftPos}px`, top: `${topPos}px` }}
            onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
            }}
            onContextMenu={(e) => onContextMenu?.(e, event)}
            onMouseEnter={() => onHoverChange?.(true)}
            onMouseLeave={(e) => {
                if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) return;
                onHoverChange?.(false);
            }}
        >
            <div
                className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-gray-900 shadow-sm z-30 pointer-events-auto"
                onMouseEnter={() => setIsGreenDotHovered(true)}
                onMouseLeave={() => setIsGreenDotHovered(false)}
            >
                {isGreenDotHovered && event.timeScheduled && event.timeScheduled !== '--:--' && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                        <div className="bg-white px-2 py-1.5 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col items-center min-w-[50px]">
                            <span className="text-base font-bold text-gray-900 font-mono tracking-tighter leading-none">{event.timeScheduled}</span>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-gray-100" style={{ transform: 'rotate(45deg)' }}></div>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative ml-4">
                <EventCapsuleVisual event={event} currentTime={currentTime} />
            </div>
        </div>
    );
};

const getEstimatedEventWidth = (event: TimelineEvent): number => (
    (event.label.length * 18) + 24 + 190 + 10
);

const ProcessDiamond: React.FC<{
    marker: ProcessMarker;
    flightId: string;
    timeScale: number;
    stagger: number; // -1, 0, or 1
    isOverlappingLabel: boolean;
}> = ({ marker, flightId, timeScale, stagger, isOverlappingLabel }) => {
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
            data-motion-layout
            data-flip-id={`marker-${flightId}-${marker.id}`}
            className={`absolute flex items-center justify-center pointer-events-auto ${isHovered ? 'z-50' : 'z-20'}`}
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
                    {marker.shortLabel || marker.label[0]}
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


const AnnotationLine: React.FC<{ annotation: Annotation; flightId: string; index: number; timeScale: number }> = ({ annotation, flightId, index, timeScale }) => {
    if (!annotation.startTime || !annotation.endTime) return null;

    const startPx = timeToPixels(annotation.startTime, timeScale);
    const logicalEndPx = timeToPixels(annotation.endTime, timeScale);

    // 计算实际需要绘制的终点（为了避让右侧的里程碑节点而向右延伸）
    let extendedEndPx = logicalEndPx;
    if (annotation.markers && annotation.markers.length > 0) {
        const sorted = [...annotation.markers].sort((a, b) => a.time.localeCompare(b.time));
        const lastMarkerPx = timeToPixels(sorted[sorted.length - 1].time, timeScale);
        
        // 我们期望在最后一个菱形(center=lastMarkerPx, width=18)的右侧留出适当空间
        // 时间标签默认从 extendedEndPx + 6 开始，要想避让，要求：
        // extendedEndPx + 6 >= lastMarkerPx + 20 (保证离中心20px，离右边缘11px)
        const minTimeLabelLeftPx = lastMarkerPx + 20;
        if (minTimeLabelLeftPx > logicalEndPx + 6) {
            extendedEndPx = minTimeLabelLeftPx - 6;
        }
    }

    const logicalWidth = logicalEndPx - startPx;
    const centerPx = startPx + logicalWidth / 2;

    // Position at bottom of row (stacked for multiple annotations)
    // 底部起始偏移 21px（标签距底8px），基线间距 34px（标签间距8px）
    const bottomOffset = 21 + (index * 34);

    // 估算文字宽度（每个字符约16px，加上更宽的padding）
    const labelWidth = annotation.label ? annotation.label.length * 16 + 24 : 0;
    const leftLineWidth = (logicalWidth - labelWidth) / 2;
    // 右侧连线从 中心+标签一半 走到 extendedEndPx
    const rightSolidLineWidth = logicalEndPx - (centerPx + labelWidth / 2);
    const rightDashedLineWidth = extendedEndPx - logicalEndPx;

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

    // 参考示例效果：胶囊形 (rounded-full) 显眼底色
    // 放行 (14:01 示例): 深青绿/Teal (#007B88)
    // 起飞 (14:31 示例): 深海军蓝/Navy (#1E4267)
    const isRelease = annotation.label?.includes('放行') || index === 0;
    const isTakeoff = !isRelease && (annotation.label?.includes('起飞') || index === 1);

    const badgeStyle: React.CSSProperties = isRelease
        ? {
            color: '#FFFFFF',
            backgroundColor: '#007B88', // 深青/Teal
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        }
        : isTakeoff
        ? {
            color: '#FFFFFF',
            backgroundColor: '#1E4267', // 深蓝/Navy
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        }
        : {
            color: '#FFFFFF',
            backgroundColor: '#374151',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
        };

    // 保持时间（数字）与文字标签字体、字号、高度、Padding、基线对齐完全一致
    const badgeClassName = "text-sm font-bold tabular-nums px-3 py-1 rounded-full leading-none shadow-sm select-none flex items-center justify-center";

    return (
        <div
            className="absolute left-0 w-full flex items-center pointer-events-none"
            style={{ bottom: `${bottomOffset}px`, zIndex: 30 - index }}
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
                    className="absolute -translate-x-1/2 flex items-center justify-center z-20"
                    style={{ left: `${centerPx}px` }}
                >
                    <span
                        className={badgeClassName}
                        style={badgeStyle}
                    >
                        {annotation.label}
                    </span>
                </div>
            )}

            {/* Right Solid Line Segment */}
            {rightSolidLineWidth > 10 && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${centerPx + labelWidth / 2}px`,
                        width: `${rightSolidLineWidth}px`,
                        height: '3px',
                        backgroundColor: lineColor,
                        borderRadius: '1.5px'
                    }}
                ></div>
            )}

            {/* Extended Dashed Line Segment */}
            {rightDashedLineWidth > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${Math.max(logicalEndPx, centerPx + labelWidth / 2)}px`,
                        width: `${rightDashedLineWidth}px`,
                        height: '3px',
                        backgroundImage: `linear-gradient(to right, ${lineColor} 50%, transparent 50%)`,
                        backgroundSize: '10px 3px',
                        backgroundRepeat: 'repeat-x',
                        borderRadius: '1.5px'
                    }}
                ></div>
            )}

            {/* The Time (At Tail) - vertically centered with the line */}
            <div className="absolute z-20" style={{ left: `${extendedEndPx + 2}px`, transform: 'translateY(-50%)', top: '0' }}>
                <span
                    className={badgeClassName}
                    style={badgeStyle}
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
                        flightId={flightId}
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
        <div className={`flex items-center rounded-full overflow-hidden shadow-sm h-[26px]`}>
            <div className={`${bgDark} ${textDark} px-2 h-full flex items-center justify-center text-xs font-bold tracking-wide whitespace-nowrap`}>
                {label}
            </div>
            <div className={`${bgLight} ${textLight} px-2 h-full flex items-center justify-center text-sm font-bold tabular-nums`}>
                {value}
            </div>
        </div>
    );
};

const ContextMenu: React.FC<{
    x: number;
    y: number;
    onClose: () => void;
    isDimmed: boolean;
    onToggleDim: () => void;
}> = ({ x, y, onClose, isDimmed, onToggleDim }) => {
    React.useEffect(() => {
        const handleClick = () => onClose();
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [onClose]);

    return (
        <div
            className="fixed z-[100] bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[120px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                onClick={() => {
                    onToggleDim();
                    onClose();
                }}
            >
                <span className="material-symbols-outlined text-lg">
                    {isDimmed ? 'settings_backup_restore' : 'visibility_off'}
                </span>
                {isDimmed ? '恢复' : '可控/可消除'}
            </button>
        </div>
    );
};

const OverflowPill: React.FC<{
    group: OverflowGroup<TimelineEvent>;
    top: number;
    currentTime?: string;
    timeScale: number;
    onExpand?: () => void;
    onEventClick?: (event: TimelineEvent) => void;
    onEventContextMenu?: (event: React.MouseEvent, timelineEvent: TimelineEvent) => void;
    onEventHoverChange?: (eventId: string, isHovered: boolean, previewRow?: HTMLElement) => void;
    dimmedEventIds: ReadonlySet<string>;
    releaseEndTime?: string;
    takeoffEndTime?: string;
}> = ({ group, top, currentTime, timeScale, onExpand, onEventClick, onEventContextMenu, onEventHoverChange, dimmedEventIds, releaseEndTime, takeoffEndTime }) => {
    const previewLayout = buildOverflowPreviewLayout<TimelineEvent>(
        group.events,
        group.leftPx,
        event => timeToPixels(event.timeScheduled || event.timeActual || '', timeScale),
        event => {
            const scheduledLeftPx = timeToPixels(event.timeScheduled || event.timeActual || '', timeScale);
            const correctedTime = getCorrectedTime(event.timeScheduled, releaseEndTime, takeoffEndTime);
            const correctedOffsetPx = correctedTime
                ? timeToPixels(correctedTime, timeScale) - scheduledLeftPx
                : 0;
            return Math.max(getEstimatedEventWidth(event), correctedOffsetPx + 24);
        },
    );

    return (
        // 预览浮层复用真实胶囊视觉，确保折叠前后的状态识别一致。
        <div
            className="absolute z-30 group/overflow"
            style={{ left: `${group.leftPx}px`, top: `${top}px` }}
        >
            <button
                type="button"
                className="overflow-attention relative flex h-7 min-w-[72px] items-center justify-center gap-1 overflow-hidden rounded-full border border-orange-700 bg-orange-500 px-3 text-xs font-black tracking-tight text-white shadow-[0_4px_14px_rgba(154,52,18,0.34)] transition-colors hover:bg-orange-600"
                style={{ animationDelay: `${-((group.leftPx % 700) / 700) * 2.5}s` }}
                aria-label={`还有 ${group.events.length} 项任务未在当前行展示，展开当前航班`}
                onClick={(event) => {
                    event.stopPropagation();
                    onExpand?.();
                }}
            >
                <span aria-hidden="true">+{group.events.length}</span>
                <span aria-hidden="true">项</span>
                <span className="material-symbols-outlined text-[15px] leading-none text-orange-100" aria-hidden="true">expand_more</span>
            </button>

            <div
                className="pointer-events-auto absolute -left-4 top-full mt-2.5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_36px_rgba(15,23,42,0.2)] group-hover/overflow:block"
                style={{ width: `${previewLayout.widthPx}px` }}
            >
                {/* 填补按钮与浮层间的空隙，鼠标移动时不会意外关闭预览。 */}
                <div aria-hidden="true" className="absolute inset-x-0 -top-3 h-3" />
                <div className="space-y-1">
                    {previewLayout.items.map(({ event, offsetPx }) => {
                        const correctedTime = getCorrectedTime(event.timeScheduled, releaseEndTime, takeoffEndTime);
                        const isDimmed = dimmedEventIds.has(event.id);
                        const correctedOffsetPx = correctedTime
                            ? Math.max(0, timeToPixels(correctedTime, timeScale) - group.leftPx)
                            : undefined;
                        const greenDotY = 34;
                        const purpleDotY = 10;

                        return (
                            <div key={event.id} data-overflow-preview-row className="relative h-14 w-full">
                                {correctedTime && correctedOffsetPx !== undefined && (
                                    <>
                                        {/* 浮层与展开行共用同一组计划点、L 型连线和修正点关系。 */}
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute z-20 w-0 border-l-2 border-dashed border-[#A78BFA] opacity-60"
                                            style={{
                                                left: `${offsetPx}px`,
                                                top: `${purpleDotY}px`,
                                                height: `${greenDotY - purpleDotY}px`,
                                            }}
                                        />
                                        <span
                                            aria-hidden="true"
                                            className="pointer-events-none absolute z-20 h-0 border-t-2 border-dashed border-[#A78BFA] opacity-60"
                                            style={{
                                                left: `${Math.min(offsetPx, correctedOffsetPx)}px`,
                                                top: `${purpleDotY}px`,
                                                width: `${Math.abs(correctedOffsetPx - offsetPx)}px`,
                                            }}
                                        />
                                        <span
                                            data-overflow-preview-purple-dot
                                            className="group/corrected absolute z-30 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                                            style={{ left: `${correctedOffsetPx}px`, top: `${purpleDotY}px` }}
                                            aria-hidden="true"
                                            onMouseEnter={(hoverEvent) => onEventHoverChange?.(event.id, true, hoverEvent.currentTarget.parentElement ?? undefined)}
                                            onMouseLeave={() => onEventHoverChange?.(event.id, false)}
                                        >
                                            <span className="size-3.5 rounded-full border-[2.5px] border-white bg-[#A78BFA] shadow-md animate-[calcBreath_2s_ease-in-out_infinite]" />
                                            <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 group-hover/corrected:block">
                                                <span className="relative flex min-w-[50px] items-center justify-center rounded-lg border border-gray-100 bg-white px-2 py-1.5 font-mono text-base font-bold leading-none tracking-tighter text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                                                    {correctedTime}
                                                    <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-100 bg-white" />
                                                </span>
                                            </span>
                                        </span>
                                    </>
                                )}

                                <button
                                    type="button"
                                    aria-label={`查看${event.label}任务详情${correctedTime ? `，修正时间${correctedTime}` : ''}`}
                                    className={`absolute flex min-h-10 w-max items-center gap-3.5 rounded-xl py-1 pr-1 text-left transition-[background-color,filter,opacity] hover:bg-slate-50 ${isDimmed ? 'opacity-40 grayscale-[80%]' : ''}`}
                                    style={{ left: `${offsetPx}px`, top: '14px' }}
                                    onClick={(clickEvent) => {
                                        clickEvent.stopPropagation();
                                        onEventClick?.(event);
                                    }}
                                    onContextMenu={(contextEvent) => onEventContextMenu?.(contextEvent, event)}
                                    onMouseEnter={(hoverEvent) => onEventHoverChange?.(event.id, true, hoverEvent.currentTarget.parentElement ?? undefined)}
                                    onMouseLeave={() => onEventHoverChange?.(event.id, false)}
                                >
                                    <span data-overflow-preview-green-dot className="size-2.5 shrink-0 -translate-x-1/2 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm" aria-hidden="true" />
                                    <EventCapsuleVisual event={event} currentTime={currentTime} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const CollapsePill: React.FC<{
    flightNo: string;
    left: number;
    top: number;
    onCollapse: () => void;
}> = ({ flightNo, left, top, onCollapse }) => (
    <button
        type="button"
        className="absolute z-30 flex h-7 min-w-[72px] items-center justify-center gap-0.5 rounded-full border border-slate-400 bg-white px-3 text-xs font-black tracking-tight text-slate-800 shadow-[0_4px_12px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-100"
        style={{ left: `${left}px`, top: `${top}px` }}
        aria-label={`收起 ${flightNo} 的全部任务`}
        onClick={(event) => {
            event.stopPropagation();
            onCollapse();
        }}
    >
        <span aria-hidden="true">收起</span>
        <span className="material-symbols-outlined text-[15px] leading-none" aria-hidden="true">expand_less</span>
    </button>
);

const GanttRowInner: React.FC<GanttRowProps> = ({ flight, timeScale, currentTime, expandAllRows = false, onClick, onEventClick, onVideoClick, onEventHover }) => {
    const [expandedFromEventId, setExpandedFromEventId] = React.useState<string | null>(null);
    const [dimmedEventIds, setDimmedEventIds] = React.useState<Set<string>>(new Set());
    const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, eventId: string } | null>(null);
    const [hoveredEventId, setHoveredEventId] = React.useState<string | null>(null);
    const hoverTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const previewHoverAnchorRef = React.useRef<{ eventId: string; greenDotY: number; purpleDotY?: number } | null>(null);
    const rowRef = React.useRef<HTMLDivElement>(null);

    const handleHoverChange = React.useCallback((eventId: string, isHovered: boolean) => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }

        if (isHovered) {
            setHoveredEventId(eventId);
        } else {
            hoverTimerRef.current = setTimeout(() => {
                setHoveredEventId(null);
            }, 250);
        }
    }, []);

    const handlePreviewHoverChange = React.useCallback((eventId: string, isHovered: boolean, previewRow?: HTMLElement) => {
        if (isHovered && previewRow && rowRef.current) {
            const rowRect = rowRef.current.getBoundingClientRect();
            const rowTop = rowRef.current.offsetTop;
            const greenDotRect = previewRow
                .querySelector<HTMLElement>('[data-overflow-preview-green-dot]')
                ?.getBoundingClientRect();
            const purpleDotRect = previewRow
                .querySelector<HTMLElement>('[data-overflow-preview-purple-dot]')
                ?.getBoundingClientRect();

            if (greenDotRect) {
                previewHoverAnchorRef.current = {
                    eventId,
                    // 连线停在圆点上缘，避免高层级虚线压住圆点。
                    greenDotY: rowTop + greenDotRect.top - rowRect.top,
                    purpleDotY: purpleDotRect
                        ? rowTop + purpleDotRect.top - rowRect.top
                        : undefined,
                };
            }
        } else if (previewHoverAnchorRef.current?.eventId === eventId) {
            previewHoverAnchorRef.current = null;
        }

        handleHoverChange(eventId, isHovered);
    }, [handleHoverChange]);

    React.useEffect(() => {
        return () => {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
            }
        };
    }, []);

    const toggleDimmed = (id: string) => {
        setDimmedEventIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleContextMenu = (e: React.MouseEvent, event: TimelineEvent) => {
        e.preventDefault();
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            eventId: event.id
        });
    };

    const handleExpansionChange = React.useCallback((nextExpandedFromEventId: string | null) => {
        const nextState = getStateAfterExpansionChange(nextExpandedFromEventId);
        setExpandedFromEventId(nextState.expandedFromEventId);
        setContextMenu(nextState.contextMenu);
    }, []);

    const isDelay = flight.tags?.includes('D') || flight.arrInfo?.status === '延误' || flight.depInfo?.status === '延误';
    const formatFlightCardTime = (time?: string) => (
        time && time !== '--:--' ? `${time}(05)` : '--:--'
    );

    // 计算事件的轨道分配
    const eventTracks = React.useMemo(
        () => assignPriorityTracks(
            flight.events,
            event => timeToPixels(event.timeScheduled || event.timeActual || '', timeScale),
            getEstimatedEventWidth,
        ),
        [flight.events, timeScale],
    );
    const maxTrack = Math.max(0, ...(Array.from(eventTracks.values()) as number[]));
    const trackCount = maxTrack + 1;
    // 判断是否有计算刻度点（需要更大的轨道间距来容纳紫色圆点）
    const releaseAnno = React.useMemo(() => flight.annotations?.find(a => a.label === '放行'), [flight.annotations]);
    const takeoffAnno = React.useMemo(() => flight.annotations?.find(a => a.label === '起飞'), [flight.annotations]);
    let hasCalcPoints = false;
    if (releaseAnno?.endTime && takeoffAnno?.endTime) {
        const [rH, rM] = releaseAnno.endTime.split(':').map(Number);
        const [tH, tM] = takeoffAnno.endTime.split(':').map(Number);
        const diff = (rH * 60 + rM) - (tH * 60 + tM);
        hasCalcPoints = diff > 15;
    }
    const trackSpacing = hasCalcPoints ? 48 : 30;
    const maxVisibleTracks = hasCalcPoints ? 1 : 2;
    const fixedRowLayout = React.useMemo(
        () => buildFixedRowOverflow<TimelineEvent>(
            flight.events,
            eventTracks,
            maxVisibleTracks,
            event => timeToPixels(event.timeScheduled || event.timeActual || '', timeScale),
        ),
        [flight.events, eventTracks, maxVisibleTracks, timeScale],
    );
    const isExpanded = expandedFromEventId !== null;
    const expandedControlGroup = expandedFromEventId
        ? fixedRowLayout.overflowGroups.find(group => group.events.some(event => event.id === expandedFromEventId))
        : undefined;
    const expandedControlEvent = expandedFromEventId
        ? flight.events.find(event => event.id === expandedFromEventId)
        : undefined;
    const expandedControlLeft = expandedControlGroup?.leftPx
        ?? (expandedControlEvent ? timeToPixels(expandedControlEvent.timeScheduled || expandedControlEvent.timeActual || '', timeScale) : 0);
    const annotationCount = flight.annotations?.length || 0;
    const rowHeight = getFlightRowHeight({ isExpanded, hasCalcPoints, trackCount, annotationCount });
    const expandedControlTop = getExpandedControlTop({ hasCalcPoints, trackCount });
    const renderedEvents = isExpanded ? flight.events : fixedRowLayout.visibleEvents;

    React.useEffect(() => {
        handleExpansionChange(getExpansionTargetEventId(expandAllRows, fixedRowLayout.overflowGroups));
    }, [expandAllRows, fixedRowLayout.overflowGroups, handleExpansionChange]);

    // 当鼠标悬浮在胶囊或点上时，报告绿点/紫点的位置与时间信息
    React.useEffect(() => {
        if (!hoveredEventId) {
            onEventHover?.(null);
            return;
        }

        const event = flight.events.find(e => e.id === hoveredEventId);
        if (!event || !event.timeScheduled || event.timeScheduled === '--:--') {
            onEventHover?.(null);
            return;
        }

        const track = eventTracks.get(event.id) || 0;
        const topPaddingCalc = trackSpacing > 30 ? 22 : 4;
        const capsuleTopY = topPaddingCalc + track * trackSpacing;
        const greenDotPx = timeToPixels(event.timeScheduled, timeScale);
        const rowTop = rowRef.current?.offsetTop || 0;
        const previewAnchor = previewHoverAnchorRef.current?.eventId === event.id
            ? previewHoverAnchorRef.current
            : undefined;
        const greenDotY = previewAnchor?.greenDotY ?? (rowTop + capsuleTopY + 11);

        let purpleDotPx: number | undefined = undefined;
        let purpleDotY: number | undefined = undefined;
        const calcPointTime = getCorrectedTime(event.timeScheduled, releaseAnno?.endTime, takeoffAnno?.endTime);
        if (calcPointTime) {
            purpleDotPx = timeToPixels(calcPointTime, timeScale);
            purpleDotY = previewAnchor?.purpleDotY ?? (rowTop + capsuleTopY - 10);
        }

        onEventHover?.({
            eventId: event.id,
            timeScheduled: event.timeScheduled,
            calcPointTime,
            greenDotPx,
            purpleDotPx,
            greenDotY,
            purpleDotY,
        });
    }, [hoveredEventId, flight, timeScale, trackSpacing, releaseAnno, takeoffAnno, eventTracks, onEventHover]);

    return (
        <div
            ref={rowRef}
            data-motion-flight-row
            data-flight-id={flight.id}
            className="flight-row flex group relative mb-3 rounded-xl shadow-sm hover:shadow-md border border-slate-100"
            style={{
                height: `${rowHeight}px`,
            }}
        >

            <div
                className={`sticky left-0 w-[260px] min-w-[260px] px-4 py-2 flex flex-col justify-center gap-1 z-40 transition-all duration-300 group-hover:z-50 rounded-l-xl rounded-r-2xl mr-2 relative group-hover:scale-[1.02] group-hover:shadow-lg origin-left cursor-pointer`}
                style={{
                    background: isDelay ? '#FDF2F8' : '#f3f4f6', // Light pink for delay
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
                                            label={isDelay ? '延误' : flight.arrInfo.status}
                                            value={flight.arrInfo.stand || '-'}
                                            type="ARR"
                                            status={isDelay ? '延误' : flight.arrInfo.status}
                                        />
                                    ) : flight.depInfo ? (
                                        <FusedInfoBadge
                                            label={isDelay ? '延误' : flight.depInfo.status}
                                            value={flight.depInfo.gate || '-'}
                                            type="DEP"
                                            status={isDelay ? '延误' : flight.depInfo.status}
                                        />
                                    ) : null}
                                </>
                            )}
                        </div>

                        {/* Secondary Status Info (Only for Dual flights) */}
                        {flight.codeshare && flight.arrInfo && flight.depInfo && (
                            <div className="w-fit">
                                <FusedInfoBadge
                                    label={isDelay ? '延误' : flight.depInfo.status}
                                    value={flight.depInfo.gate || '-'}
                                    type="DEP"
                                    status={isDelay ? '延误' : flight.depInfo.status}
                                />
                            </div>
                        )}
                    </div>

                    {/* Row 3: STA / STD & Actions */}
                    <div className="flex items-center justify-between w-full">
                        {/* 与详情卡保持一致：STA 用绿色，STD 用蓝色。 */}
                        <div className="flex items-center gap-1.5 font-mono text-sm font-bold italic leading-none tabular-nums">
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {formatFlightCardTime(flight.times?.sta)}
                            </span>
                            <span className="text-slate-400" aria-hidden="true">/</span>
                            <span className="text-blue-600 dark:text-blue-400">
                                {formatFlightCardTime(flight.times?.std)}
                            </span>
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
                                            : (flightCardTagColorMap[tag] || 'bg-gray-400');
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
                                            const colorClass = flightCardTagColorMap[tag] || 'bg-gray-400';
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
                {/* 用行内表面色覆盖边缘点阵，只强化分组而不增加行高。 */}
                <div aria-hidden="true" className="gantt-row-edge absolute inset-x-0 top-0 z-[15] h-1.5 border-t pointer-events-none" />
                <div aria-hidden="true" className="gantt-row-edge absolute inset-x-0 bottom-0 z-[15] h-1.5 border-b pointer-events-none" />

                {flight.annotations?.map((anno, idx) => (
                    <AnnotationLine key={`anno-${idx}`} annotation={anno} flightId={flight.id} index={idx} timeScale={timeScale} />
                ))}
                {renderedEvents.map((event) => (
                    <EventPill
                        key={event.id}
                        event={event}
                        flightId={flight.id}
                        track={eventTracks.get(event.id) || 0}
                        timeScale={timeScale}
                        currentTime={currentTime}
                        onEventClick={onEventClick}
                        onContextMenu={handleContextMenu}
                        isDimmed={dimmedEventIds.has(event.id)}
                        trackSpacing={trackSpacing}
                        onHoverChange={(isHovered) => handleHoverChange(event.id, isHovered)}
                    />
                ))}

                {/* 紧凑行仅显示隐藏任务入口；展开后在同一时间位置复用为收起入口。 */}
                {!isExpanded && fixedRowLayout.overflowGroups.map((group) => (
                    <OverflowPill
                        key={`overflow-${group.leftPx}-${group.events[0]?.id}`}
                        group={group}
                        top={56}
                        currentTime={currentTime}
                        timeScale={timeScale}
                        onExpand={() => handleExpansionChange(group.events[0]?.id || null)}
                        onEventClick={onEventClick}
                        onEventContextMenu={handleContextMenu}
                        onEventHoverChange={handlePreviewHoverChange}
                        dimmedEventIds={dimmedEventIds}
                        releaseEndTime={releaseAnno?.endTime}
                        takeoffEndTime={takeoffAnno?.endTime}
                    />
                ))}

                {isExpanded && expandedFromEventId && (
                    <CollapsePill
                        flightNo={flight.flightNo.split(' / ')[0]}
                        left={expandedControlLeft}
                        top={expandedControlTop}
                        onCollapse={() => handleExpansionChange(null)}
                    />
                )}

                {contextMenu && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        isDimmed={dimmedEventIds.has(contextMenu.eventId)}
                        onToggleDim={() => toggleDimmed(contextMenu.eventId)}
                        onClose={() => setContextMenu(null)}
                    />
                )}

                {/* Calculated Scale Points - rendered as separate layer ABOVE all capsules */}
                {(() => {
                    if (!releaseAnno?.endTime || !takeoffAnno?.endTime) return null;

                    const calcColor = '#A78BFA';

                    return renderedEvents.map((event) => {
                        if (!event.timeScheduled || event.timeScheduled === '--:--') return null;
                        const calcPointTime = getCorrectedTime(event.timeScheduled, releaseAnno.endTime, takeoffAnno.endTime);
                        if (!calcPointTime) return null;

                        const track = eventTracks.get(event.id) || 0;
                        const topPaddingCalc = trackSpacing > 30 ? 22 : 4;
                        const capsuleTopY = topPaddingCalc + track * trackSpacing; // top of capsule
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
                                        zIndex: 30,
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
                                        zIndex: 30,
                                    }}
                                />
                                {/* Purple dot above its own capsule */}
                                <CalcPointWithTooltip
                                    motionId={event.id}
                                    flightId={flight.id}
                                    calcRelPx={purpleDotPx}
                                    calcPointTime={calcPointTime}
                                    calcColor={calcColor}
                                    dotVerticalOffset={0}
                                    isInsideCapsule={false}
                                    lineStartX={0}
                                    lineWidth={0}
                                    absoluteTop={purpleDotY}
                                    onHoverChange={(isHovered) => handleHoverChange(event.id, isHovered)}
                                />
                            </React.Fragment>
                        );
                    });
                })()}
            </div>
        </div >
    );
};

export const GanttRow = React.memo(GanttRowInner, (prevProps, nextProps) => {
    return (
        prevProps.flight === nextProps.flight &&
        prevProps.timeScale === nextProps.timeScale &&
        prevProps.currentTime === nextProps.currentTime &&
        prevProps.expandAllRows === nextProps.expandAllRows &&
        prevProps.onClick === nextProps.onClick &&
        prevProps.onEventClick === nextProps.onEventClick &&
        prevProps.onVideoClick === nextProps.onVideoClick &&
        prevProps.onEventHover === nextProps.onEventHover
    );
});
