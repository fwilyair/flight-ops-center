import React from 'react';
import { createPortal } from 'react-dom';
import type { Flight, FlightType } from '../types';
import {
    addFlightTagToLeg,
    getFlightCardLegJustification,
    getFlightCardLegPresence,
    getFlightCardTagPickerPosition,
    getFlightNumberSizeClass,
    getLegFlightNumber,
    getLegFlightType,
    getLegTags,
    getTagDisplay,
    getTypeVisibility,
} from './flightCardLayout';
import type { FlightLeg } from './flightCardLayout';
import { FLIGHT_TAG_OPTIONS, flightCardTagColorMap } from './flightTags';
import type { FlightTag } from './flightTags';

export interface FlightCardProps {
    flight: Flight;
    height?: number;
    isControlView?: boolean;
    onClick?: () => void;
    onVideoClick?: () => void;
    onFlightUpdate?: (flight: Flight) => void;
}

const PICKER_SIZE = { width: 252, height: 110 } as const;

const FLIGHT_TYPE_LABELS: Record<FlightType, { label: string; className: string }> = {
    REG: { label: '正班', className: 'text-indigo-600' },
    CARGO: { label: '货班', className: 'text-purple-600' },
    EXTRA: { label: '加班', className: 'text-orange-600' },
    FERRY: { label: '调机', className: 'text-cyan-600' },
    DIV: { label: '备降', className: 'text-rose-600' },
};

const formatCardTime = (time?: string) => (
    time && time !== '--:--' ? `${time}(05)` : '--:--'
);

const META_BADGE_BASE = 'flex h-5 min-w-0 items-center justify-center whitespace-nowrap rounded-[5px] bg-gradient-to-br px-[3px] text-center text-[11px] font-bold leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_1px_2px_rgba(15,23,42,0.05)]';
const ARRIVAL_STAND_SURFACE = 'from-emerald-100 via-emerald-50 to-white/80 text-emerald-900';
const DEPARTURE_GATE_SURFACE = 'from-blue-100 via-blue-50 to-white/80 text-blue-900';

const FlightTypeLabel: React.FC<{ type?: FlightType; visible: boolean }> = ({ type, visible }) => {
    if (!type || !visible) return null;
    const config = FLIGHT_TYPE_LABELS[type];

    return (
        <span className={`whitespace-nowrap text-[12px] font-bold leading-none ${config.className}`}>
            {config.label}
        </span>
    );
};

const TagDot: React.FC<{ tag: string; hiddenCount?: number }> = ({ tag, hiddenCount = 0 }) => {
    const isOverflow = hiddenCount > 0;
    const isWide = tag.length > 1 && !isOverflow;
    const colorClass = isOverflow
        ? 'bg-slate-300 text-slate-700'
        : flightCardTagColorMap[tag] || 'bg-gray-400';
    const defaultTextColor = tag === '控' || isOverflow ? '' : 'text-white';

    return (
        <span
            className={`flex size-[18px] shrink-0 items-center justify-center rounded-full font-bold leading-none shadow-sm ${colorClass} ${defaultTextColor} ${isOverflow ? 'pb-[2px] text-[12px]' : isWide ? 'text-[8px] tracking-[-0.5px]' : 'text-[10px]'}`}
            title={isOverflow ? `还有 ${hiddenCount} 个标记` : tag}
        >
            {isOverflow ? '…' : tag}
        </span>
    );
};

const LegTagRow: React.FC<{
    leg: FlightLeg;
    tags: string[];
    capacity: number;
    triggerRef: React.RefObject<HTMLButtonElement | null>;
    isPickerOpen: boolean;
    onAddClick: (event: React.MouseEvent<HTMLButtonElement>, leg: FlightLeg) => void;
    onVideoClick?: () => void;
}> = ({ leg, tags, capacity, triggerRef, isPickerOpen, onAddClick, onVideoClick }) => {
    const { visibleTags, hiddenCount } = getTagDisplay(tags, capacity);
    const isDeparture = leg === 'departure';

    return (
        <div className="flex h-[22px] min-w-0 items-center justify-between px-1">
            <div className="flex min-w-0 items-center gap-1">
                {visibleTags.map((tag, index) => (
                    <TagDot key={`${leg}-${tag}-${index}`} tag={tag} />
                ))}
                {hiddenCount > 0 && <TagDot tag="…" hiddenCount={hiddenCount} />}
                <button
                    ref={triggerRef}
                    type="button"
                    aria-label={`添加${isDeparture ? '出港' : '进港'}标记`}
                    aria-haspopup="dialog"
                    aria-expanded={isPickerOpen}
                    className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-dashed border-slate-400 bg-white/80 text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                    onClick={(event) => onAddClick(event, leg)}
                >
                    <span className="text-[14px] font-semibold leading-none" aria-hidden="true">+</span>
                </button>
            </div>

            {isDeparture && (
                <button
                    type="button"
                    title="播放监控视频"
                    aria-label="播放监控视频"
                    className="ml-1 flex size-[20px] shrink-0 items-center justify-center rounded-full text-blue-600 hover:bg-blue-50"
                    onClick={(event) => {
                        event.stopPropagation();
                        onVideoClick?.();
                    }}
                >
                    <svg
                        aria-hidden="true"
                        className="size-[19px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="9" />
                        <path d="m10 8.5 5 3.5-5 3.5Z" />
                    </svg>
                </button>
            )}
        </div>
    );
};

export const FlightCard: React.FC<FlightCardProps> = ({
    flight,
    height = 140,
    isControlView = false,
    onClick,
    onVideoClick,
    onFlightUpdate,
}) => {
    const [selectedLeg, setSelectedLeg] = React.useState<FlightLeg | null>(null);
    const [pickerPosition, setPickerPosition] = React.useState<{ left: number; top: number } | null>(null);
    const arrivalTriggerRef = React.useRef<HTMLButtonElement>(null);
    const departureTriggerRef = React.useRef<HTMLButtonElement>(null);
    const pickerRef = React.useRef<HTMLDivElement>(null);

    const legPresence = getFlightCardLegPresence(flight);
    const arrivalTags = getLegTags(flight, 'arrival');
    const departureTags = getLegTags(flight, 'departure');
    const arrivalType = legPresence.arrival ? getLegFlightType(flight, 'arrival') : undefined;
    const departureType = legPresence.departure ? getLegFlightType(flight, 'departure') : undefined;
    const typeVisibility = getTypeVisibility(arrivalType, departureType);
    const arrivalFlightNo = getLegFlightNumber(flight, 'arrival');
    const departureFlightNo = getLegFlightNumber(flight, 'departure');
    const isDelayed = flight.arrInfo?.status === '延误' || flight.depInfo?.status === '延误';

    const closePicker = React.useCallback(() => {
        setSelectedLeg(null);
        setPickerPosition(null);
    }, []);

    const updatePickerPosition = React.useCallback((leg: FlightLeg) => {
        const trigger = leg === 'arrival' ? arrivalTriggerRef.current : departureTriggerRef.current;
        if (!trigger) return;

        setPickerPosition(getFlightCardTagPickerPosition(
            trigger.getBoundingClientRect(),
            PICKER_SIZE,
            { width: window.innerWidth, height: window.innerHeight },
        ));
    }, []);

    const handleAddClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>, leg: FlightLeg) => {
        event.stopPropagation();
        if (selectedLeg === leg) {
            closePicker();
            return;
        }

        updatePickerPosition(leg);
        setSelectedLeg(leg);
    }, [closePicker, selectedLeg, updatePickerPosition]);

    React.useEffect(() => closePicker(), [closePicker, flight.id]);

    React.useEffect(() => {
        if (!selectedLeg) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (
                arrivalTriggerRef.current?.contains(target)
                || departureTriggerRef.current?.contains(target)
                || pickerRef.current?.contains(target)
            ) return;

            closePicker();
        };

        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [closePicker, selectedLeg]);

    React.useLayoutEffect(() => {
        if (!selectedLeg) return;

        const update = () => updatePickerPosition(selectedLeg);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);
        return () => {
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [height, selectedLeg, updatePickerPosition]);

    const handleTagSelection = React.useCallback((tag: FlightTag) => {
        if (!selectedLeg) return;
        onFlightUpdate?.(addFlightTagToLeg(flight, selectedLeg, tag));
        closePicker();
    }, [closePicker, flight, onFlightUpdate, selectedLeg]);

    const selectedTags = selectedLeg ? getLegTags(flight, selectedLeg) : [];

    // 管控视图：只保留 进出港航班号及计划时间 [HH:MM(05)] 单行展示
    // 配色与穿透视图保持一致 (text-emerald-900 / text-blue-900)
    // 超长航班号（如 ZZMZT6343 / ZZMZT6344 达 18 字）时自动阶梯缩小字号，防止右侧时间被裁切截断
    if (isControlView) {
        const hasBoth = legPresence.arrival && legPresence.departure;
        const flightNumSize = 'text-[19px]';
        const timeSize = 'text-[12px]';

        return (
            <div
                data-motion-layout
                className={`sticky left-0 z-40 mr-2 box-border w-[260px] min-w-[260px] flex-none shrink-0 self-start rounded-l-xl rounded-r-2xl border-y border-r border-slate-300/80 px-3 flex flex-col shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] transition-[background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDelayed ? 'bg-rose-50' : 'bg-slate-100'} ${onClick ? 'cursor-pointer hover:bg-slate-200' : ''}`}
                style={{ height: `${height}px` }}
                onClick={(event) => {
                    event.stopPropagation();
                    onClick?.();
                }}
            >
                <div className={`flex flex-col w-full h-full ${hasBoth ? 'justify-between py-1.5' : 'justify-center'}`}>
                    {legPresence.arrival && (
                        <div className="flex items-center justify-start gap-[6px] text-emerald-700">
                            <span className={`min-w-0 whitespace-nowrap pr-[3px] font-mono font-extrabold italic leading-none tabular-nums ${flightNumSize}`} title={arrivalFlightNo}>
                                {arrivalFlightNo}
                            </span>
                            <span className={`min-w-0 whitespace-nowrap text-center font-mono ${timeSize} font-extrabold leading-none text-emerald-900 tabular-nums`}>
                                {formatCardTime(flight.times?.sta)}
                            </span>
                            <span className={`${META_BADGE_BASE} ${flight.arrInfo?.status === '延误' ? 'from-red-200 via-red-100 to-white/80 text-red-700' : 'from-emerald-200 via-emerald-100 to-white/80 text-emerald-800'} px-[4px]`}>
                                {flight.arrInfo?.status || '-'}
                            </span>
                            <span className={`${META_BADGE_BASE} ${ARRIVAL_STAND_SURFACE} px-[4px] font-mono`}>
                                {flight.arrInfo?.stand || '-'}
                            </span>
                        </div>
                    )}
                    {legPresence.departure && (
                        <div className={`flex items-center gap-[6px] text-blue-700 ${hasBoth ? 'justify-end' : 'justify-start'}`}>
                            <span className={`min-w-0 whitespace-nowrap pr-[3px] font-mono font-extrabold italic leading-none tabular-nums ${flightNumSize}`} title={departureFlightNo}>
                                {departureFlightNo}
                            </span>
                            <span className={`min-w-0 whitespace-nowrap text-center font-mono ${timeSize} font-extrabold leading-none text-blue-900 tabular-nums`}>
                                {formatCardTime(flight.times?.std)}
                            </span>
                            <span className={`${META_BADGE_BASE} ${flight.depInfo?.status === '延误' ? 'from-red-200 via-red-100 to-white/80 text-red-700' : 'from-blue-200 via-blue-100 to-white/80 text-blue-800'} px-[4px]`}>
                                {flight.depInfo?.status || '-'}
                            </span>
                            <span className={`${META_BADGE_BASE} ${DEPARTURE_GATE_SURFACE} px-[4px] font-mono`}>
                                {flight.depInfo?.gate || '-'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div
            data-motion-layout
            className={`sticky left-0 z-40 mr-2 box-border min-h-[140px] w-[260px] min-w-[260px] flex-none shrink-0 self-start rounded-l-xl rounded-r-2xl border-y border-r border-slate-300/80 px-2.5 py-2 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] transition-[background-color,border-color,box-shadow,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDelayed ? 'bg-rose-50' : 'bg-slate-100'} ${onClick ? 'cursor-pointer' : ''}`}
            style={{ height: `${height}px` }}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.();
            }}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center overflow-hidden rounded-l-xl rounded-r-2xl"
            >
                <div
                    className="origin-center -rotate-10 scale-125 transform text-[9rem] font-black italic leading-none text-slate-900/[0.04] blur-[1px]"
                    style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
                >
                    {flight.flightNo.substring(0, 2)}
                </div>
            </div>

            <div className="relative z-10 flex h-full min-h-0 flex-col">
                {legPresence.arrival ? (
                    <section aria-label="进港航班" className={`flex min-h-0 flex-1 flex-col gap-1 ${getFlightCardLegJustification('arrival', legPresence)}`}>
                        <div className="flex h-7 min-w-0 items-end text-emerald-700">
                            <div className="grid w-full min-w-0 grid-cols-[72px_65px_31px_31px_minmax(27px,1fr)] items-baseline gap-x-[3px]">
                            <span className={`min-w-0 overflow-hidden whitespace-nowrap font-mono font-extrabold italic leading-none tabular-nums ${getFlightNumberSizeClass(arrivalFlightNo)}`} title={arrivalFlightNo}>
                                {arrivalFlightNo}
                            </span>
                            <span className="min-w-0 whitespace-nowrap text-center font-mono text-[12px] font-extrabold leading-none text-emerald-900 tabular-nums">
                                {formatCardTime(flight.times?.sta)}
                            </span>
                            <span className={`${META_BADGE_BASE} ${flight.arrInfo?.status === '延误' ? 'from-red-200 via-red-100 to-white/80 text-red-700' : 'from-emerald-200 via-emerald-100 to-white/80 text-emerald-800'}`}>
                                {flight.arrInfo?.status || '-'}
                            </span>
                            <span className={`${META_BADGE_BASE} ${ARRIVAL_STAND_SURFACE} px-0.5 font-mono`}>
                                {flight.arrInfo?.stand || '-'}
                            </span>
                            <span className="flex h-5 min-w-0 items-center justify-end leading-none">
                                <FlightTypeLabel type={arrivalType} visible={typeVisibility.arrival} />
                            </span>
                            </div>
                        </div>
                        <LegTagRow
                            leg="arrival"
                            tags={arrivalTags}
                            capacity={9}
                            triggerRef={arrivalTriggerRef}
                            isPickerOpen={selectedLeg === 'arrival'}
                            onAddClick={handleAddClick}
                        />
                    </section>
                ) : null}

                {legPresence.departure ? (
                    <section aria-label="出港航班" className={`flex min-h-0 flex-1 flex-col gap-1 ${getFlightCardLegJustification('departure', legPresence)}`}>
                        <div className="flex h-7 min-w-0 items-start text-blue-700">
                            <div className="grid w-full min-w-0 grid-cols-[72px_65px_31px_31px_minmax(27px,1fr)] items-baseline gap-x-[3px]">
                            <span className={`min-w-0 overflow-hidden whitespace-nowrap font-mono font-extrabold italic leading-none tabular-nums ${getFlightNumberSizeClass(departureFlightNo)}`} title={departureFlightNo}>
                                {departureFlightNo}
                            </span>
                            <span className="min-w-0 whitespace-nowrap text-center font-mono text-[12px] font-extrabold leading-none text-blue-900 tabular-nums">
                                {formatCardTime(flight.times?.std)}
                            </span>
                            <span className={`${META_BADGE_BASE} ${flight.depInfo?.status === '延误' ? 'from-red-200 via-red-100 to-white/80 text-red-700' : 'from-blue-200 via-blue-100 to-white/80 text-blue-800'}`}>
                                {flight.depInfo?.status || '-'}
                            </span>
                            <span className={`${META_BADGE_BASE} ${DEPARTURE_GATE_SURFACE} px-0.5 font-mono`}>
                                {flight.depInfo?.gate || '-'}
                            </span>
                            <span className="flex h-5 min-w-0 items-center justify-end leading-none">
                                <FlightTypeLabel type={departureType} visible={typeVisibility.departure} />
                            </span>
                            </div>
                        </div>
                        <LegTagRow
                            leg="departure"
                            tags={departureTags}
                            capacity={7}
                            triggerRef={departureTriggerRef}
                            isPickerOpen={selectedLeg === 'departure'}
                            onAddClick={handleAddClick}
                            onVideoClick={onVideoClick}
                        />
                    </section>
                ) : null}
            </div>

            {selectedLeg && pickerPosition && createPortal(
                <div
                    ref={pickerRef}
                    role="dialog"
                    aria-label={`选择${selectedLeg === 'arrival' ? '进港' : '出港'}标记`}
                    className="fixed z-[200] grid h-[110px] w-[252px] grid-cols-5 place-items-center gap-2 rounded-2xl border border-white/90 bg-white p-[14px] shadow-[0_18px_48px_rgba(15,23,42,0.28)]"
                    style={{ left: `${pickerPosition.left}px`, top: `${pickerPosition.top}px` }}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                >
                    {FLIGHT_TAG_OPTIONS.map(tag => {
                        const isAdded = selectedTags.includes(tag);
                        const isWide = tag.length > 1;
                        return (
                            <button
                                key={tag}
                                type="button"
                                disabled={isAdded}
                                aria-label={isAdded ? `${tag}标记已添加` : `添加${tag}标记`}
                                title={isAdded ? '已添加' : `添加标记：${tag}`}
                                className={`flex size-9 items-center justify-center rounded-full font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-30 ${flightCardTagColorMap[tag]} ${tag === '控' ? '' : 'text-white'} ${isWide ? 'text-[10px] tracking-tighter' : 'text-sm'}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleTagSelection(tag);
                                }}
                            >
                                {tag}
                            </button>
                        );
                    })}
                </div>,
                document.body,
            )}
        </div>
    );
};
