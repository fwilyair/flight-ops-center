import assert from 'node:assert/strict';
import test from 'node:test';

import { assignPriorityTracks, buildFixedRowOverflow, buildOverflowPreviewLayout, getCorrectedTime, getExpandedControlTop, getExpansionTargetEventId, getFlightRowHeight, getTimeDifferenceMinutes } from './flightRowLayout.ts';

type TestEvent = {
    id: string;
    status: string;
    x: number;
};

test('keeps only events assigned to visible tracks', () => {
    const events: TestEvent[] = [
        { id: 'visible-0', status: 'pending', x: 100 },
        { id: 'visible-1', status: 'warning', x: 140 },
        { id: 'hidden-2', status: 'alert', x: 180 },
    ];
    const tracks = new Map([
        ['visible-0', 0],
        ['visible-1', 1],
        ['hidden-2', 2],
    ]);

    const layout = buildFixedRowOverflow(events, tracks, 2, event => event.x);

    assert.deepEqual(layout.visibleEvents.map(event => event.id), ['visible-0', 'visible-1']);
    assert.deepEqual(layout.overflowGroups.flatMap(group => group.events.map(event => event.id)), ['hidden-2']);
});

test('groups nearby hidden events but preserves separate crowded time ranges', () => {
    const events: TestEvent[] = [
        { id: 'early-a', status: 'pending', x: 100 },
        { id: 'early-b', status: 'warning', x: 170 },
        { id: 'late', status: 'pending', x: 520 },
    ];
    const tracks = new Map(events.map(event => [event.id, 2]));

    const layout = buildFixedRowOverflow(events, tracks, 2, event => event.x, 160);

    assert.equal(layout.overflowGroups.length, 2);
    assert.deepEqual(layout.overflowGroups[0].events.map(event => event.id), ['early-a', 'early-b']);
    assert.equal(layout.overflowGroups[0].leftPx, 100);
    assert.deepEqual(layout.overflowGroups[1].events.map(event => event.id), ['late']);
    assert.equal(layout.overflowGroups[1].leftPx, 520);
});

test('marks an overflow group critical when it hides an alert or overdue task', () => {
    const events: TestEvent[] = [
        { id: 'normal', status: 'pending', x: 100 },
        { id: 'critical', status: 'overtime-incomplete', x: 140 },
    ];
    const tracks = new Map(events.map(event => [event.id, 2]));

    const layout = buildFixedRowOverflow(events, tracks, 2, event => event.x);

    assert.equal(layout.overflowGroups[0].severity, 'critical');
});

test('keeps a collapsed flight row fixed at the compact height', () => {
    assert.equal(getFlightRowHeight({
        isExpanded: false,
        hasCalcPoints: false,
        trackCount: 5,
        annotationCount: 2,
    }), 140);
});

test('restores the original content-driven height after expanding a flight row', () => {
    assert.equal(getFlightRowHeight({
        isExpanded: true,
        hasCalcPoints: false,
        trackCount: 3,
        annotationCount: 2,
    }), 206);

    assert.equal(getFlightRowHeight({
        isExpanded: true,
        hasCalcPoints: true,
        trackCount: 3,
        annotationCount: 2,
    }), 278);
});

test('places the collapse control below every expanded capsule track', () => {
    assert.equal(getExpandedControlTop({ hasCalcPoints: false, trackCount: 3 }), 98);
    assert.equal(getExpandedControlTop({ hasCalcPoints: true, trackCount: 3 }), 152);
});

test('keeps the least collapsible status on the highest visible track', () => {
    const events: TestEvent[] = [
        { id: 'completed', status: 'overtime-completed', x: 100 },
        { id: 'warning', status: 'warning', x: 100 },
        { id: 'alert', status: 'alert', x: 100 },
        { id: 'incomplete', status: 'overtime-incomplete', x: 100 },
    ];

    const tracks = assignPriorityTracks(events, event => event.x, () => 240);

    assert.equal(tracks.get('incomplete'), 0);
    assert.equal(tracks.get('alert'), 1);
    assert.equal(tracks.get('warning'), 2);
    assert.equal(tracks.get('completed'), 3);
});

test('reuses a high-priority track when task capsules do not overlap', () => {
    const events: TestEvent[] = [
        { id: 'early', status: 'overtime-incomplete', x: 100 },
        { id: 'late', status: 'overtime-incomplete', x: 400 },
    ];

    const tracks = assignPriorityTracks(events, event => event.x, () => 240);

    assert.equal(tracks.get('early'), 0);
    assert.equal(tracks.get('late'), 0);
});

test('maps the shared expand-all button state to the first hidden task', () => {
    const hiddenEvent: TestEvent = { id: 'hidden', status: 'warning', x: 180 };
    const groups = [{ leftPx: 180, events: [hiddenEvent], severity: 'warning' as const }];

    assert.equal(getExpansionTargetEventId(true, groups), 'hidden');
    assert.equal(getExpansionTargetEventId(false, groups), null);
    assert.equal(getExpansionTargetEventId(true, []), null);
});

test('calculates corrected time only when the baseline offset exceeds 15 minutes', () => {
    assert.equal(getCorrectedTime('10:00', '10:30', '10:00'), '10:30');
    assert.equal(getCorrectedTime('23:50', '10:30', '10:00'), '00:20');
    assert.equal(getCorrectedTime('10:00', '10:15', '10:00'), undefined);
    assert.equal(getCorrectedTime('--:--', '10:30', '10:00'), undefined);
});

test('aligns overflow preview capsules by their timeline pixel offsets', () => {
    const events: TestEvent[] = [
        { id: '10:00', status: 'warning', x: 100 },
        { id: '10:05', status: 'warning', x: 140 },
        { id: '10:20', status: 'warning', x: 260 },
    ];

    const layout = buildOverflowPreviewLayout(events, 100, event => event.x, () => 240);

    assert.deepEqual(layout.items.map(item => item.offsetPx), [0, 40, 160]);
    assert.equal(layout.widthPx, 432);
});

test('calculates actual minus scheduled time across midnight', () => {
    assert.equal(getTimeDifferenceMinutes('10:45', '10:00'), 45);
    assert.equal(getTimeDifferenceMinutes('00:10', '23:50'), 20);
    assert.equal(getTimeDifferenceMinutes('09:50', '10:00'), -10);
    assert.equal(getTimeDifferenceMinutes('--:--', '10:00'), undefined);
});
