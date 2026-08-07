export type OverflowSeverity = 'normal' | 'warning' | 'critical';

export interface FixedRowEvent {
    id: string;
    status?: string;
}

export interface OverflowGroup<T> {
    leftPx: number;
    events: T[];
    severity: OverflowSeverity;
}

export interface FixedRowOverflowLayout<T> {
    visibleEvents: T[];
    overflowGroups: OverflowGroup<T>[];
}

export interface OverflowPreviewLayoutItem<T> {
    event: T;
    offsetPx: number;
}

export interface OverflowPreviewLayout<T> {
    items: Array<OverflowPreviewLayoutItem<T>>;
    widthPx: number;
}

export interface FlightRowHeightOptions {
    isExpanded: boolean;
    hasCalcPoints: boolean;
    trackCount: number;
    annotationCount: number;
}

export interface ExpandedControlTopOptions {
    hasCalcPoints: boolean;
    trackCount: number;
}

const CRITICAL_STATUSES = new Set(['alert', 'overtime-incomplete', 'delayed']);
const WARNING_STATUSES = new Set(['warning', 'overtime-completed']);
const COLLAPSE_PRIORITY: Record<string, number> = {
    // 数值越小越早占用可见轨道，使高风险的超时未完成最后才被折叠。
    'overtime-incomplete': 0,
    alert: 1,
    warning: 2,
    'overtime-completed': 3,
};

const getSeverity = <T extends FixedRowEvent>(events: T[]): OverflowSeverity => {
    if (events.some(event => CRITICAL_STATUSES.has(event.status || ''))) return 'critical';
    if (events.some(event => WARNING_STATUSES.has(event.status || ''))) return 'warning';
    return 'normal';
};

export const getFlightRowHeight = ({
    isExpanded,
    hasCalcPoints,
    trackCount,
    annotationCount,
}: FlightRowHeightOptions): number => {
    if (!isExpanded) return 140;

    const trackSpacing = hasCalcPoints ? 48 : 30;
    const topPadding = hasCalcPoints ? 22 : 4;
    const contentHeight = topPadding + (trackCount * trackSpacing) + (annotationCount * 34) + 10;
    return Math.max(130, contentHeight) + 34;
};

export const getExpandedControlTop = ({
    hasCalcPoints,
    trackCount,
}: ExpandedControlTopOptions): number => {
    const trackSpacing = hasCalcPoints ? 48 : 30;
    const topPadding = hasCalcPoints ? 22 : 4;
    const capsuleHeight = 26;
    // 统一从最后一条轨道的胶囊底部起算，避免标签长度导致收起按钮间距不一。
    const controlGap = 8;
    const lastTrackTop = topPadding + (Math.max(0, trackCount - 1) * trackSpacing);
    return lastTrackTop + capsuleHeight + controlGap;
};

export const assignPriorityTracks = <T extends FixedRowEvent>(
    events: T[],
    getStartPx: (event: T) => number,
    getWidthPx: (event: T) => number,
): Map<string, number> => {
    const tracks = new Map<string, number>();
    const trackIntervals: Array<Array<{ startPx: number; endPx: number }>> = [];
    // 先按业务风险占用轨道，固定行高截断时才能稳定保留高优先级任务。
    const rankedEvents = events
        .map((event, originalIndex) => ({
            event,
            originalIndex,
            startPx: getStartPx(event),
            widthPx: getWidthPx(event),
            collapsePriority: COLLAPSE_PRIORITY[event.status || ''] ?? 1,
        }))
        .sort((a, b) => (
            a.collapsePriority - b.collapsePriority
            || a.startPx - b.startPx
            || a.originalIndex - b.originalIndex
        ));

    rankedEvents.forEach(({ event, startPx, widthPx }) => {
        const endPx = startPx + widthPx;
        let assignedTrack = trackIntervals.findIndex(intervals => intervals.every(interval => (
            endPx <= interval.startPx || startPx >= interval.endPx
        )));

        if (assignedTrack === -1) {
            assignedTrack = trackIntervals.length;
            trackIntervals.push([]);
        }

        trackIntervals[assignedTrack].push({ startPx, endPx });
        tracks.set(event.id, assignedTrack);
    });

    return tracks;
};

export const buildFixedRowOverflow = <T extends FixedRowEvent>(
    events: T[],
    eventTracks: Map<string, number>,
    maxVisibleTracks: number,
    getLeftPx: (event: T) => number,
    groupGapPx = 180,
): FixedRowOverflowLayout<T> => {
    const visibleEvents = events.filter(event => (eventTracks.get(event.id) ?? 0) < maxVisibleTracks);
    const hiddenEvents = events
        .filter(event => (eventTracks.get(event.id) ?? 0) >= maxVisibleTracks)
        .map(event => ({ event, leftPx: getLeftPx(event) }))
        .sort((a, b) => a.leftPx - b.leftPx);

    const overflowGroups: OverflowGroup<T>[] = [];

    hiddenEvents.forEach(({ event, leftPx }) => {
        const currentGroup = overflowGroups.at(-1);
        const previousEvent = currentGroup?.events.at(-1);
        const previousLeftPx = previousEvent ? getLeftPx(previousEvent) : undefined;

        if (!currentGroup || previousLeftPx === undefined || leftPx - previousLeftPx > groupGapPx) {
            overflowGroups.push({ leftPx, events: [event], severity: getSeverity([event]) });
            return;
        }

        currentGroup.events.push(event);
        currentGroup.severity = getSeverity(currentGroup.events);
    });

    return { visibleEvents, overflowGroups };
};

export const getExpansionTargetEventId = <T extends FixedRowEvent>(
    shouldExpand: boolean,
    overflowGroups: Array<OverflowGroup<T>>,
): string | null => {
    if (!shouldExpand) return null;
    return overflowGroups[0]?.events[0]?.id ?? null;
};

export const getCorrectedTime = (
    scheduledTime?: string,
    releaseEndTime?: string,
    takeoffEndTime?: string,
): string | undefined => {
    if (!scheduledTime || scheduledTime === '--:--' || !releaseEndTime || !takeoffEndTime) {
        return undefined;
    }

    const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60) + minutes;
    };
    const correctionMinutes = toMinutes(releaseEndTime) - toMinutes(takeoffEndTime);
    if (correctionMinutes <= 15) return undefined;

    const correctedMinutes = (toMinutes(scheduledTime) + correctionMinutes + 1440) % 1440;
    const hours = Math.floor(correctedMinutes / 60);
    const minutes = correctedMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getTimeDifferenceMinutes = (
    laterTime?: string,
    earlierTime?: string,
): number | undefined => {
    if (!laterTime || laterTime === '--:--' || !earlierTime || earlierTime === '--:--') {
        return undefined;
    }

    const toMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours * 60) + minutes;
    };
    let difference = toMinutes(laterTime) - toMinutes(earlierTime);
    if (difference > 720) difference -= 1440;
    if (difference < -720) difference += 1440;
    return difference;
};

export const buildOverflowPreviewLayout = <T>(
    events: T[],
    anchorLeftPx: number,
    getLeftPx: (event: T) => number,
    getWidthPx: (event: T) => number,
    minimumWidthPx = 340,
    horizontalPaddingPx = 32,
): OverflowPreviewLayout<T> => {
    const items = events.map(event => ({
        event,
        offsetPx: Math.max(0, getLeftPx(event) - anchorLeftPx),
    }));
    const contentRightPx = Math.max(
        0,
        ...items.map(({ event, offsetPx }) => offsetPx + getWidthPx(event)),
    );

    return {
        items,
        widthPx: Math.max(minimumWidthPx, contentRightPx + horizontalPaddingPx),
    };
};
