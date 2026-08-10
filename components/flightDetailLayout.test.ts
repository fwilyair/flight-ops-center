import assert from 'node:assert/strict';
import test from 'node:test';
import type { Flight } from '../types.ts';

const baseFlight = {
    id: 'detail-layout',
    flightNo: 'TEST001',
    times: { sta: '10:00', std: '11:00' },
    events: [],
    annotations: [],
} satisfies Flight;

test('shows only arrival-related times for an arrival-only flight', async () => {
    const layout = await import('./flightDetailLayout.ts').catch(() => null);
    assert.ok(layout);
    if (!layout) return;

    assert.deepEqual(
        layout.getFlightDetailTimeLayout({
            ...baseFlight,
            arrInfo: { status: '到达', stand: '266R' },
        }),
        {
            showPreviousDeparture: true,
            showArrivalTimes: true,
            showDepartureTimes: false,
            showDepartureControlTimes: false,
            rowGridClass: 'grid-cols-[80px_1fr]',
        },
    );
});

test('shows only departure-related times for a departure-only flight', async () => {
    const layout = await import('./flightDetailLayout.ts').catch(() => null);
    assert.ok(layout);
    if (!layout) return;

    assert.deepEqual(
        layout.getFlightDetailTimeLayout({
            ...baseFlight,
            depInfo: { status: '登机', gate: '06' },
        }),
        {
            showPreviousDeparture: false,
            showArrivalTimes: false,
            showDepartureTimes: true,
            showDepartureControlTimes: true,
            rowGridClass: 'grid-cols-[80px_1fr]',
        },
    );
});

test('keeps both time columns for a turnaround flight', async () => {
    const layout = await import('./flightDetailLayout.ts').catch(() => null);
    assert.ok(layout);
    if (!layout) return;

    assert.deepEqual(
        layout.getFlightDetailTimeLayout({
            ...baseFlight,
            arrInfo: { status: '到达', stand: '243' },
            depInfo: { status: '正常', gate: '15' },
        }),
        {
            showPreviousDeparture: true,
            showArrivalTimes: true,
            showDepartureTimes: true,
            showDepartureControlTimes: true,
            rowGridClass: 'grid-cols-[80px_1fr_1fr]',
        },
    );
});
