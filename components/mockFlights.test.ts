import assert from 'node:assert/strict';
import test from 'node:test';

import { MOCK_FLIGHTS } from '../data.ts';

const EXPECTED_METADATA_BY_FLIGHT_ID = {
    '1': {
        arrTags: ['冰', 'Q', '控', 'C'],
        depTags: ['I', 'D', 'V', '互天', '机', '重要'],
        arrFlightType: 'REG',
        depFlightType: 'REG',
    },
    '2': {
        arrTags: ['V'],
        depTags: ['I', '控'],
        arrFlightType: 'REG',
        depFlightType: 'REG',
    },
    '3': {
        arrTags: ['D'],
        depTags: ['D'],
        arrFlightType: 'REG',
        depFlightType: 'REG',
    },
    '4': {
        arrTags: ['冰', 'C'],
        depTags: ['冰', 'C'],
        arrFlightType: 'REG',
        depFlightType: 'REG',
    },
    '5': {
        arrTags: ['冰', 'Q'],
        depTags: [],
        arrFlightType: 'REG',
        depFlightType: undefined,
    },
    '6': {
        arrTags: [],
        depTags: ['控', 'V'],
        arrFlightType: undefined,
        depFlightType: 'CARGO',
    },
    '7': {
        arrTags: ['冰', 'Q', '控', 'C', 'I', 'D', 'V', '互天', '机', '重要'],
        depTags: ['D', 'V', '互天', '机'],
        arrFlightType: 'REG',
        depFlightType: 'FERRY',
    },
} as const;

test('provides STA and STD for every mock flight card', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        assert.ok(
            flight.times.sta && flight.times.sta !== '--:--',
            `${flight.flightNo} should provide STA`,
        );
        assert.ok(
            flight.times.std && flight.times.std !== '--:--',
            `${flight.flightNo} should provide STD`,
        );
    });
});

test('uses a single normalized flight number for every turnaround flight', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        assert.ok(
            !flight.flightNo.includes('/'),
            `${flight.flightNo} should not combine multiple flight numbers`,
        );
    });
});

test('provides independent card metadata for every mock flight', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        const expected = EXPECTED_METADATA_BY_FLIGHT_ID[flight.id as keyof typeof EXPECTED_METADATA_BY_FLIGHT_ID];
        assert.ok(expected, `${flight.flightNo} should have expected metadata`);
        assert.deepEqual(flight.arrTags, expected.arrTags, `${flight.flightNo} arrival tags`);
        assert.deepEqual(flight.depTags, expected.depTags, `${flight.flightNo} departure tags`);
        assert.equal(flight.arrFlightType, expected.arrFlightType, `${flight.flightNo} arrival flight type`);
        assert.equal(flight.depFlightType, expected.depFlightType, `${flight.flightNo} departure flight type`);
        assert.deepEqual(
            flight.tags,
            Array.from(new Set([...flight.arrTags, ...flight.depTags])),
            `${flight.flightNo} legacy tags should be unique union of card tags`,
        );
    });
});

test('includes exactly one arrival-only and one departure-only flight', () => {
    const arrivalOnlyFlights = MOCK_FLIGHTS.filter(flight => flight.arrInfo && !flight.depInfo);
    const departureOnlyFlights = MOCK_FLIGHTS.filter(flight => !flight.arrInfo && flight.depInfo);

    assert.equal(MOCK_FLIGHTS.length, 7);
    assert.deepEqual(arrivalOnlyFlights.map(flight => flight.flightNo), ['3U8888']);
    assert.deepEqual(departureOnlyFlights.map(flight => flight.flightNo), ['Y87502']);
});

test('uses no baseline for arrival-only flights and both operational baselines for departure-only flights', () => {
    const arrivalOnlyFlight = MOCK_FLIGHTS.find(flight => flight.arrInfo && !flight.depInfo);
    const departureOnlyFlight = MOCK_FLIGHTS.find(flight => !flight.arrInfo && flight.depInfo);

    assert.ok(arrivalOnlyFlight);
    assert.deepEqual(arrivalOnlyFlight.annotations, []);
    assert.ok(departureOnlyFlight);
    assert.deepEqual(departureOnlyFlight.annotations?.map(annotation => annotation.label), ['放行', '起飞']);
});

test('includes the long-flight-number card fixture', () => {
    const edgeFlight = MOCK_FLIGHTS.find((flight) => flight.flightNo === 'ZZMZT6343');
    assert.ok(edgeFlight);
    assert.equal(edgeFlight.flightNo, 'ZZMZT6343');
    assert.equal(edgeFlight.codeshare, 'ZZMZT6344');
    assert.ok(edgeFlight.flightNo.length >= 8);
    assert.ok(edgeFlight.codeshare.length >= 8);
    assert.deepEqual(edgeFlight.arrTags, ['冰', 'Q', '控', 'C', 'I', 'D', 'V', '互天', '机', '重要']);
    assert.deepEqual(edgeFlight.depTags, ['D', 'V', '互天', '机']);
    assert.equal(edgeFlight.arrFlightType, 'REG');
    assert.equal(edgeFlight.depFlightType, 'FERRY');
});
