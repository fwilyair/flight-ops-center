import assert from 'node:assert/strict';
import test from 'node:test';
import { splitFlightRemarkLines } from './flightRemarks.ts';

test('preserves entered line breaks when displaying a flight remark', () => {
    assert.deepEqual(splitFlightRemarkLines('第一行\n第二行'), ['第一行', '第二行']);
    assert.deepEqual(splitFlightRemarkLines('第一行\n\n第三行'), ['第一行', '', '第三行']);
    assert.deepEqual(splitFlightRemarkLines('第一行\r\n第二行'), ['第一行', '第二行']);
});
