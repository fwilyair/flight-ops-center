import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('adds a selected flight tag without duplicating an existing tag', async () => {
    const flightTags = await import('./flightTags.ts').catch(() => null);

    assert.ok(flightTags, 'flight tag utilities should exist');
    if (!flightTags) return;

    assert.deepEqual(flightTags.addFlightTag(['V'], '控'), ['V', '控']);
    assert.deepEqual(flightTags.addFlightTag(['V', '控'], '控'), ['V', '控']);
});

test('exposes every supported flight tag in the picker', async () => {
    const flightTags = await import('./flightTags.ts').catch(() => null);

    assert.ok(flightTags, 'flight tag utilities should exist');
    if (!flightTags) return;

    assert.deepEqual(flightTags.FLIGHT_TAG_OPTIONS, [
        '冰', 'Q', '控', 'C', 'I', 'D', 'V', '互天', '机', '重要',
    ]);
});

test('centers the tag picker within the flight detail panel', async () => {
    const flightTags = await import('./flightTags.ts');

    assert.equal(typeof flightTags.getCenteredTagPickerPosition, 'function');
    if (typeof flightTags.getCenteredTagPickerPosition !== 'function') return;

    assert.deepEqual(
        flightTags.getCenteredTagPickerPosition(
            { left: 420, width: 400 },
            { bottom: 356 },
        ),
        { left: 620, top: 368 },
    );
});

test('shows separate read-only arrival and departure tags in flight details', async () => {
    const source = await readFile(new URL('./FlightDetailPanel.tsx', import.meta.url), 'utf8');

    assert.match(source, /label="进港标记"/);
    assert.match(source, /label="出港标记"/);
    assert.match(source, /getLegTags\(flight, 'arrival'\)/);
    assert.match(source, /getLegTags\(flight, 'departure'\)/);
    assert.doesNotMatch(source, /aria-label="添加航班标记"/);
    assert.doesNotMatch(source, /flight-tag-picker/);
});
