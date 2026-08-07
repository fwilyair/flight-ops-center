import assert from 'node:assert/strict';
import test from 'node:test';
import type { Flight } from '../types.ts';
import {
    addFlightTagToLeg,
    getFlightNumberSizeClass,
    getLegFlightType,
    getLegTags,
    getTagDisplay,
    getTypeVisibility,
} from './flightCardLayout.ts';

const flight = {
    id: 'edge',
    flightNo: 'ZZMZT6343',
    codeshare: 'ZZMZT6344',
    tags: ['冰'],
    flightType: 'REG',
    arrTags: ['冰', 'Q'],
    depTags: ['D'],
    arrFlightType: 'REG',
    depFlightType: 'FERRY',
    times: { sta: '09:15', std: '10:00' },
    events: [],
    annotations: [],
} satisfies Flight;

test('reads independent arrival and departure card data', () => {
    assert.deepEqual(getLegTags(flight, 'arrival'), ['冰', 'Q']);
    assert.deepEqual(getLegTags(flight, 'departure'), ['D']);
    assert.equal(getLegFlightType(flight, 'arrival'), 'REG');
    assert.equal(getLegFlightType(flight, 'departure'), 'FERRY');
});

test('falls back to legacy shared fields during migration', () => {
    const legacy = { ...flight, arrTags: undefined, depTags: undefined, arrFlightType: undefined, depFlightType: undefined };
    assert.deepEqual(getLegTags(legacy, 'arrival'), ['冰']);
    assert.deepEqual(getLegTags(legacy, 'departure'), ['冰']);
    assert.equal(getLegFlightType(legacy, 'arrival'), 'REG');
    assert.equal(getLegFlightType(legacy, 'departure'), 'REG');
});

test('shows one type when both legs match and two when they differ', () => {
    assert.deepEqual(getTypeVisibility('REG', 'REG'), { arrival: true, departure: false });
    assert.deepEqual(getTypeVisibility('REG', 'FERRY'), { arrival: true, departure: true });
});

test('shows only the existing type when one leg type is missing', () => {
    const arrivalOnly: Flight = { ...flight, flightType: undefined, arrFlightType: 'REG', depFlightType: undefined };
    const departureOnly: Flight = { ...flight, flightType: undefined, arrFlightType: undefined, depFlightType: 'FERRY' };

    assert.equal(getLegFlightType(arrivalOnly, 'departure'), undefined);
    assert.deepEqual(getTypeVisibility(getLegFlightType(arrivalOnly, 'arrival'), getLegFlightType(arrivalOnly, 'departure')), {
        arrival: true,
        departure: false,
    });
    assert.equal(getLegFlightType(departureOnly, 'arrival'), undefined);
    assert.deepEqual(getTypeVisibility(getLegFlightType(departureOnly, 'arrival'), getLegFlightType(departureOnly, 'departure')), {
        arrival: false,
        departure: true,
    });
});

test('hides types when neither leg type exists', () => {
    const withoutTypes: Flight = { ...flight, flightType: undefined, arrFlightType: undefined, depFlightType: undefined };

    assert.equal(getLegFlightType(withoutTypes, 'arrival'), undefined);
    assert.equal(getLegFlightType(withoutTypes, 'departure'), undefined);
    assert.deepEqual(getTypeVisibility(getLegFlightType(withoutTypes, 'arrival'), getLegFlightType(withoutTypes, 'departure')), {
        arrival: false,
        departure: false,
    });
});

test('treats arrival info as the source of truth for arrival card presence and type', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.getFlightCardLegPresence, 'function');
    if (typeof layout.getFlightCardLegPresence !== 'function') return;

    const arrivalOnly: Flight = {
        ...flight,
        arrInfo: { status: '到达', stand: '101' },
        depInfo: undefined,
    };
    const presence = layout.getFlightCardLegPresence(arrivalOnly);
    const visibility = getTypeVisibility(
        presence.arrival ? getLegFlightType(arrivalOnly, 'arrival') : undefined,
        presence.departure ? getLegFlightType(arrivalOnly, 'departure') : undefined,
    );

    assert.deepEqual(presence, { arrival: true, departure: false });
    assert.deepEqual(visibility, { arrival: true, departure: false });
});

test('treats departure info as the source of truth for departure card presence and type', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.getFlightCardLegPresence, 'function');
    if (typeof layout.getFlightCardLegPresence !== 'function') return;

    const departureOnly: Flight = {
        ...flight,
        arrInfo: undefined,
        depInfo: { status: '正常', gate: 'G12' },
    };
    const presence = layout.getFlightCardLegPresence(departureOnly);
    const visibility = getTypeVisibility(
        presence.arrival ? getLegFlightType(departureOnly, 'arrival') : undefined,
        presence.departure ? getLegFlightType(departureOnly, 'departure') : undefined,
    );

    assert.deepEqual(presence, { arrival: false, departure: true });
    assert.deepEqual(visibility, { arrival: false, departure: true });
});

test('keeps the add control outside tag overflow capacity', () => {
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 0 });
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控', 'C', 'I'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 2 });
});

test('adds a detail tag to both existing legs and updates the legacy union immutably', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.addFlightTagToExistingLegs, 'function');
    if (typeof layout.addFlightTagToExistingLegs !== 'function') return;

    const turnaround: Flight = {
        ...flight,
        arrInfo: { status: '到达', stand: '101' },
        depInfo: { status: '正常', gate: 'G12' },
    };
    const original = structuredClone(turnaround);
    const updated = layout.addFlightTagToExistingLegs(turnaround, '控');

    assert.deepEqual(turnaround, original);
    assert.deepEqual(updated.arrTags, ['冰', 'Q', '控']);
    assert.deepEqual(updated.depTags, ['D', '控']);
    assert.deepEqual(updated.tags, ['冰', 'Q', '控', 'D']);
});

test('adds a detail tag only to the existing single leg without duplicates', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.addFlightTagToExistingLegs, 'function');
    if (typeof layout.addFlightTagToExistingLegs !== 'function') return;

    const departureOnly: Flight = {
        ...flight,
        arrInfo: undefined,
        depInfo: { status: '正常', gate: 'G12' },
        arrTags: undefined,
        depTags: ['D'],
        tags: ['D'],
    };
    const original = structuredClone(departureOnly);
    const updated = layout.addFlightTagToExistingLegs(departureOnly, 'D');

    assert.deepEqual(departureOnly, original);
    assert.equal(updated.arrTags, undefined);
    assert.deepEqual(updated.depTags, ['D']);
    assert.deepEqual(updated.tags, ['D']);
});

test('uses the second combined flight number for a departure without codeshare', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.getLegFlightNumber, 'function');
    if (typeof layout.getLegFlightNumber !== 'function') return;

    const combined: Flight = {
        ...flight,
        flightNo: 'CA1538 / CA1539',
        codeshare: undefined,
        arrInfo: undefined,
        depInfo: { status: '正常' },
    };

    assert.equal(layout.getLegFlightNumber(combined, 'departure'), 'CA1539');
});

test('falls back to the single flight number for a departure without codeshare', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.getLegFlightNumber, 'function');
    if (typeof layout.getLegFlightNumber !== 'function') return;

    const single: Flight = {
        ...flight,
        flightNo: 'MU5206',
        codeshare: undefined,
        arrInfo: undefined,
        depInfo: { status: '正常' },
    };

    assert.equal(layout.getLegFlightNumber(single, 'arrival'), 'MU5206');
    assert.equal(layout.getLegFlightNumber(single, 'departure'), 'MU5206');
});

test('uses compact typography at the eight-character boundary', () => {
    assert.equal(getFlightNumberSizeClass('ABC1234'), 'text-[17px]');
    assert.equal(getFlightNumberSizeClass('ABCD1234'), 'text-[12px] tracking-[-0.65px]');
    assert.equal(getFlightNumberSizeClass('ABCDEF1234'), 'text-[12px] tracking-[-0.65px]');
});

test('adds a tag only to the selected leg and synchronizes legacy detail tags', () => {
    const original = structuredClone(flight);
    const updated = addFlightTagToLeg(flight, 'departure', '控');

    assert.deepEqual(flight, original);
    assert.deepEqual(updated.arrTags, ['冰', 'Q']);
    assert.deepEqual(updated.depTags, ['D', '控']);
    assert.deepEqual(updated.tags, ['冰', 'Q', 'D', '控']);
    assert.notStrictEqual(updated.depTags, flight.depTags);
});

test('centers the card tag picker below its trigger and clamps it inside the viewport', async () => {
    const layout = await import('./flightCardLayout.ts');
    assert.equal(typeof layout.getFlightCardTagPickerPosition, 'function');
    if (typeof layout.getFlightCardTagPickerPosition !== 'function') return;

    assert.deepEqual(
        layout.getFlightCardTagPickerPosition(
            { left: 4, right: 24, top: 40, bottom: 60, width: 20 },
            { width: 252, height: 110 },
            { width: 320, height: 600 },
        ),
        { left: 8, top: 68 },
    );
});

test('places the card tag picker above its trigger when it would cross the viewport bottom', async () => {
    const { getFlightCardTagPickerPosition } = await import('./flightCardLayout.ts');

    assert.deepEqual(
        getFlightCardTagPickerPosition(
            { left: 260, right: 280, top: 540, bottom: 560, width: 20 },
            { width: 252, height: 110 },
            { width: 320, height: 600 },
        ),
        { left: 60, top: 422 },
    );
});
