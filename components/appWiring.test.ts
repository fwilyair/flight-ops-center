import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('persists flight card updates through the app flight updater', async () => {
    const appSource = await readFile(new URL('../App.tsx', import.meta.url), 'utf8');
    const ganttRow = appSource.match(/<GanttRow\b[\s\S]*?\/>/)?.[0];

    assert.ok(ganttRow, 'App should render GanttRow');
    assert.match(ganttRow, /onFlightUpdate=\{handleFlightUpdate\}/);
});
