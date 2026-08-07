import assert from 'node:assert/strict';
import test from 'node:test';
import { getFlightRemarkKeyAction, shouldCloseWithEscape, shouldReturnToCurrentTime } from './keyboardPolicy.ts';

test('only flight and capsule details close with Escape', () => {
    assert.equal(shouldCloseWithEscape('flight-detail', 'Escape'), true);
    assert.equal(shouldCloseWithEscape('capsule-detail', 'Escape'), true);
    assert.equal(shouldCloseWithEscape('help', 'Escape'), false);
    assert.equal(shouldCloseWithEscape('video', 'Escape'), false);
    assert.equal(shouldCloseWithEscape('flight-detail', 'Enter'), false);
    assert.equal(shouldCloseWithEscape('capsule-detail', ' '), false);
});

test('keeps Space as the shortcut for returning to current time', () => {
    assert.equal(shouldReturnToCurrentTime(' ', 'Space', false), true);
    assert.equal(shouldReturnToCurrentTime(' ', 'Space', true), false);
    assert.equal(shouldReturnToCurrentTime('Enter', 'Enter', false), false);
});

test('submits or cancels flight remark editing with dedicated keys', () => {
    assert.equal(getFlightRemarkKeyAction('Enter', false), 'submit');
    assert.equal(getFlightRemarkKeyAction('Enter', true), null);
    assert.equal(getFlightRemarkKeyAction('Escape', false), 'cancel');
    assert.equal(getFlightRemarkKeyAction('Tab', false), null);
});
