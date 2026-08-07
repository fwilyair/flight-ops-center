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

test('keeps the add control outside tag overflow capacity', () => {
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 0 });
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控', 'C', 'I'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 2 });
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
