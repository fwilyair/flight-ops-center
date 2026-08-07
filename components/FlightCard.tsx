import React from 'react';
import { createPortal } from 'react-dom';
import type { Flight, FlightType } from '../types';
import {
    addFlightTagToLeg,
    getFlightCardLegPresence,
    getFlightCardTagPickerPosition,
    getFlightNumberSizeClass,
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
        <div className="flex h-[22px] min-w-0 items-center justify-between">
            <div className="flex min-w-0 items-center gap-[3px]">
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
                    className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-dashed border-slate-400 bg-white/80 text-slate-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                    onClick={(event) => onAddClick(event, leg)}
                >
                    <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden="true">add</span>
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
                    <span className="material-symbols-outlined text-[19px] leading-none" aria-hidden="true">play_circle</span>
                </button>
            )}
        </div>
    );
};

export const FlightCard: React.FC<FlightCardProps> = ({
    flight,
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
    const arrivalFlightNo = flight.flightNo.split(' / ')[0];
    const departureFlightNo = flight.codeshare || '-';
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
    }, [selectedLeg, updatePickerPosition]);

    const handleTagSelection = React.useCallback((tag: FlightTag) => {
        if (!selectedLeg) return;
        onFlightUpdate?.(addFlightTagToLeg(flight, selectedLeg, tag));
        closePicker();
    }, [closePicker, flight, onFlightUpdate, selectedLeg]);

    const selectedTags = selectedLeg ? getLegTags(flight, selectedLeg) : [];

    return (
        <div
            className={`sticky left-0 z-40 mr-2 box-border h-[140px] w-[260px] min-w-[260px] flex-none shrink-0 self-start rounded-l-xl rounded-r-2xl border-y border-r border-slate-200 px-2.5 py-2 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)] ${isDelayed ? 'bg-rose-50' : 'bg-slate-100'} ${onClick ? 'cursor-pointer' : ''}`}
            onClick={(event) => {
                event.stopPropagation();
                onClick?.();
            }}
        >
            <div className="grid h-[122px] grid-rows-[28px_22px_1px_28px_22px] gap-y-1">
                {legPresence.arrival ? (
                    <div className="grid min-w-0 grid-cols-[69px_62px_27px_30px_minmax(28px,1fr)] items-center gap-x-[3px] text-emerald-700">
                        <span className={`min-w-0 overflow-hidden whitespace-nowrap font-mono font-bold leading-none tabular-nums ${getFlightNumberSizeClass(arrivalFlightNo)}`} title={arrivalFlightNo}>
                            {arrivalFlightNo}
                        </span>
                        <span className="min-w-0 whitespace-nowrap text-center font-mono text-[10px] font-bold leading-none tabular-nums">
                            {formatCardTime(flight.times?.sta)}
                        </span>
                        <span className={`min-w-0 whitespace-nowrap text-center text-[12px] font-bold leading-none ${flight.arrInfo?.status === '延误' ? 'text-red-600' : ''}`}>
                            {flight.arrInfo?.status || '-'}
                        </span>
                        <span className="min-w-0 whitespace-nowrap text-center font-mono text-[12px] font-bold leading-none">
                            {flight.arrInfo?.stand || '-'}
                        </span>
                        <span className="min-w-0 text-right leading-none">
                            <FlightTypeLabel type={arrivalType} visible={typeVisibility.arrival} />
                        </span>
                    </div>
                ) : <div aria-hidden="true" />}

                {legPresence.arrival ? (
                    <LegTagRow
                        leg="arrival"
                        tags={arrivalTags}
                        capacity={9}
                        triggerRef={arrivalTriggerRef}
                        isPickerOpen={selectedLeg === 'arrival'}
                        onAddClick={handleAddClick}
                    />
                ) : <div aria-hidden="true" />}

                <div className="h-px bg-slate-300" aria-hidden="true" />

                {legPresence.departure ? (
                    <div className="grid min-w-0 grid-cols-[69px_62px_27px_30px_minmax(28px,1fr)] items-center gap-x-[3px] text-blue-700">
                        <span className={`min-w-0 overflow-hidden whitespace-nowrap font-mono font-bold leading-none tabular-nums ${getFlightNumberSizeClass(departureFlightNo)}`} title={departureFlightNo}>
                            {departureFlightNo}
                        </span>
                        <span className="min-w-0 whitespace-nowrap text-center font-mono text-[10px] font-bold leading-none tabular-nums">
                            {formatCardTime(flight.times?.std)}
                        </span>
                        <span className={`min-w-0 whitespace-nowrap text-center text-[12px] font-bold leading-none ${flight.depInfo?.status === '延误' ? 'text-red-600' : ''}`}>
                            {flight.depInfo?.status || '-'}
                        </span>
                        <span className="min-w-0 whitespace-nowrap text-center font-mono text-[12px] font-bold leading-none">
                            {flight.depInfo?.gate || '-'}
                        </span>
                        <span className="min-w-0 text-right leading-none">
                            <FlightTypeLabel type={departureType} visible={typeVisibility.departure} />
                        </span>
                    </div>
                ) : <div aria-hidden="true" />}

                {legPresence.departure ? (
                    <LegTagRow
                        leg="departure"
                        tags={departureTags}
                        capacity={7}
                        triggerRef={departureTriggerRef}
                        isPickerOpen={selectedLeg === 'departure'}
                        onAddClick={handleAddClick}
                        onVideoClick={onVideoClick}
                    />
                ) : <div aria-hidden="true" />}
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
