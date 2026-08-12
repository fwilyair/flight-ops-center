import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('persists flight card updates through the app flight updater', async () => {
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
    const ganttRow = appSource.match(/<GanttRow\b[\s\S]*?\/>/)?.[0];

    assert.ok(ganttRow, 'App should render GanttRow');
    assert.match(ganttRow, /onFlightUpdate=\{handleFlightUpdate\}/);
});

test('does not replay the full flight-list entrance when switching views', async () => {
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
    const motionKey = appSource.match(/const filteredFlightKey = useMemo\([\s\S]*?\n  \);/)?.[0];

    assert.ok(motionKey, 'App should define a flight-list motion key');
    assert.doesNotMatch(motionKey, /isControlView/);
});

test('crossfades persistent penetration and control layers during view switches', async () => {
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');
    const cardSource = await readFile(new URL('./FlightCard.tsx', import.meta.url), 'utf8');
    const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

    assert.equal((rowSource.match(/data-view-mode-layer/g) || []).length, 2);
    assert.equal((cardSource.match(/data-view-mode-layer/g) || []).length, 2);
    assert.match(rowSource, /data-active=\{isControlView\}/);
    assert.match(rowSource, /data-active=\{!isControlView\}/);
    assert.match(cardSource, /data-active=\{isControlView\}/);
    assert.match(cardSource, /data-active=\{!isControlView\}/);
    assert.match(indexSource, /\.view-mode-layer \{[\s\S]*opacity 140ms cubic-bezier\(0\.23, 1, 0\.32, 1\)[\s\S]*transform 180ms cubic-bezier\(0\.23, 1, 0\.32, 1\)[\s\S]*visibility 0s linear 180ms/);
    assert.match(indexSource, /\.view-mode-layer \{[\s\S]*pointer-events: none;/);
    assert.match(indexSource, /\.view-mode-layer \{[\s\S]*z-index: 20;/);
    assert.match(indexSource, /\.view-mode-layer\[data-active="true"\]/);
    assert.match(indexSource, /\.view-mode-layer\[data-active="true"\] \{[\s\S]*pointer-events: auto;/);
    assert.match(indexSource, /\.view-mode-layer:not\(\[data-active="true"\]\) \* \{[\s\S]*animation-play-state: paused !important;/);
    assert.match(indexSource, /\.flight-row,[\s\S]*\.flight-card-shell \{[\s\S]*transition-duration: 240ms;/);
});

test('portals the task context menu outside transformed view layers', async () => {
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');

    assert.match(rowSource, /import \{ createPortal \} from 'react-dom';/);
    assert.match(
        rowSource,
        /!isControlView && contextMenu && createPortal\([\s\S]*?<ContextMenu[\s\S]*?document\.body[\s\S]*?\)\}/,
    );
});

test('raises the overflow preview row above later flight rows while hovered', async () => {
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');
    const indexSource = await readFile(new URL('../index.html', import.meta.url), 'utf8');

    assert.match(rowSource, /data-overflow-preview-anchor/);
    assert.match(
        indexSource,
        /\.flight-row:has\(\[data-overflow-preview-anchor\]:hover\) \{[\s\S]*?z-index: 50;/,
    );
});
