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

test('provides the scheduled time required by each existing flight leg', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        if (flight.arrInfo) {
            assert.ok(
                flight.times.sta && flight.times.sta !== '--:--',
                `${flight.flightNo} should provide STA for its arrival leg`,
            );
        }
        if (flight.depInfo) {
            assert.ok(
                flight.times.std && flight.times.std !== '--:--',
                `${flight.flightNo} should provide STD for its departure leg`,
            );
        }
    });
});

test('provides a non-empty flight number for every flight', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        assert.ok(flight.flightNo.trim().length > 0);
    });
});

test('preserves independent card metadata for the original mock flights', () => {
    Object.entries(EXPECTED_METADATA_BY_FLIGHT_ID).forEach(([flightId, expected]) => {
        const flight = MOCK_FLIGHTS.find(candidate => candidate.id === flightId);
        assert.ok(flight, `flight ${flightId} should exist`);
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

test('includes arrival-only and departure-only fixtures', () => {
    const arrivalOnlyFlights = MOCK_FLIGHTS.filter(flight => flight.arrInfo && !flight.depInfo);
    const departureOnlyFlights = MOCK_FLIGHTS.filter(flight => !flight.arrInfo && flight.depInfo);

    assert.ok(arrivalOnlyFlights.some(flight => flight.flightNo === '3U8888'));
    assert.ok(arrivalOnlyFlights.some(flight => flight.flightNo === 'FM9311'));
    assert.ok(departureOnlyFlights.some(flight => flight.flightNo === 'Y87502'));
    assert.ok(departureOnlyFlights.some(flight => flight.flightNo === 'JD5321'));
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
