import assert from 'node:assert/strict';
import test from 'node:test';

import { MOCK_FLIGHTS } from '../data.ts';

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
