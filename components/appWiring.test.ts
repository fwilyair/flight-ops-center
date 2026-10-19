import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('persists flight card updates through the app flight updater', async () => {
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
    const ganttRow = appSource.match(/<GanttRow\b[\s\S]*?\/>/)?.[0];

    assert.ok(ganttRow, 'App should render GanttRow');
    assert.match(ganttRow, /onFlightUpdate=\{handleFlightUpdate\}/);
});

test('documents the split color rules for inspection action buttons', async () => {
    const manualSource = await readFile(new URL('./HelpManualModal.tsx', import.meta.url), 'utf8');

    assert.match(manualSource, /入、登、推：未完成白色，完成绿色/);
    assert.match(manualSource, /允：未操作白、正常完成绿、超时完成黄、超时未完成红/);
});

test('anchors hover guides to the measured row timeline origin', async () => {
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
    const rowSource = await readFile(new URL('./GanttRow.tsx', import.meta.url), 'utf8');

    assert.match(rowSource, /timelineOffsetPx: number/);
    assert.match(rowSource, /const timelineRef = React\.useRef<HTMLDivElement>\(null\)/);
    assert.match(rowSource, /ref=\{timelineRef\}[\s\S]*?gantt-grid-bg/);
    assert.match(rowSource, /const timelineOffsetPx = timelineRef\.current\?\.offsetLeft \?\? 0/);
    assert.match(appSource, /renderedHoverInfo\.timelineOffsetPx \+ renderedHoverInfo\.greenDotPx/);
    assert.match(appSource, /renderedHoverInfo\.timelineOffsetPx \+ renderedHoverInfo\.purpleDotPx/);
    assert.doesNotMatch(appSource, /HOVER_GUIDE_TIMELINE_OFFSET_PX/);
});
