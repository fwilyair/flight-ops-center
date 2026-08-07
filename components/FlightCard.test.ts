import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('keeps flight card controls independent of Material Symbols font', async () => {
    const source = await readFile(new URL('./FlightCard.tsx', import.meta.url), 'utf8');

    assert.doesNotMatch(source, /material-symbols-outlined/);
});
