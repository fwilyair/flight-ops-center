import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('keeps flight card controls independent of Material Symbols font', async () => {
    const source = await readFile(new URL('./FlightCard.tsx', import.meta.url), 'utf8');

    assert.doesNotMatch(source, /material-symbols-outlined/);
});

test('stretches flight card modules with the expanded row height', async () => {
    const cardSource = await readFile(new URL('./FlightCard.tsx', import.meta.url), 'utf8');
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');

    assert.match(cardSource, /height\?: number/);
    assert.match(cardSource, /style=\{\{ height: `\$\{height\}px` \}\}/);
    assert.match(cardSource, /aria-label="进港航班" className="flex min-h-0 flex-1 flex-col justify-start/);
    assert.match(cardSource, /aria-label="出港航班" className="flex min-h-0 flex-1 flex-col justify-end/);
    assert.match(cardSource, /flex h-7[^\"]*items-end[^\"]*text-emerald-700/);
    assert.match(cardSource, /flex h-7[^\"]*items-start[^\"]*text-blue-700/);
    assert.match(cardSource, /grid w-full[^\"]*items-baseline/);
    assert.match(cardSource, /min-w-0 overflow-hidden whitespace-nowrap font-mono/);
    assert.match(cardSource, /font-mono font-extrabold italic leading-none/);
    assert.match(cardSource, /META_BADGE_BASE = '.*bg-gradient-to-br/);
    assert.match(cardSource, /from-emerald-200 via-emerald-100 to-white\/80/);
    assert.match(cardSource, /from-blue-200 via-blue-100 to-white\/80/);
    assert.match(cardSource, /min-w-0 whitespace-nowrap text-center font-mono/);
    assert.match(cardSource, /flex h-5 min-w-0 items-center justify-end/);
    assert.doesNotMatch(cardSource, /railColorClass/);
    assert.match(cardSource, /flight\.flightNo\.substring\(0, 2\)/);
    assert.match(cardSource, /text-slate-900\/\[0\.04\]/);
    assert.doesNotMatch(cardSource, /mx-auto flex min-w-0 items-center justify-center/);
    assert.match(rowSource, /<FlightCard[\s\S]*height=\{rowHeight\}/);
});

test('separates each flight card from the transparent timeline row', async () => {
    const cardSource = await readFile(new URL('./FlightCard.tsx', import.meta.url), 'utf8');
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');
    const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');

    assert.match(cardSource, /border-y border-r border-slate-300\/80/);
    assert.match(indexSource, /\.flight-row \{[\s\S]*?background-color: transparent;/);
    assert.doesNotMatch(rowSource, /className="flight-row[^"]*(?:shadow|border)/);
    assert.match(rowSource, /className="flight-row[^"]*mb-3/);
    assert.match(appSource, /className="flight-rows-area/);
    assert.match(indexSource, /\.flight-rows-area \{[\s\S]*?#ffffff 0 260px/);
});
