# Flight Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current combined flight card with a fixed 260px × 140px four-row arrival/departure card that supports independent types, independent tags, long flight numbers, per-leg tag addition, and the existing video action.

**Architecture:** Add leg-specific fields to `Flight`, isolate card data rules in pure tested helpers, and extract the sticky left card from `GanttRow` into `FlightCard`. The card owns its small Portal tag picker but writes changes through `App`'s existing `handleFlightUpdate` path so list and detail state remain synchronized.

**Tech Stack:** React 19, TypeScript 5.8, Tailwind utility classes, Node test runner, Vite 6.

---

## File Structure

- Create `components/flightCardLayout.ts`: pure rules for leg data, type deduplication, long-number sizing, tag overflow, and per-leg tag updates.
- Create `components/flightCardLayout.test.ts`: unit tests for every compact-card edge case.
- Create `components/FlightCard.tsx`: four-row card UI, per-leg tag rows, Portal picker, and video control.
- Modify `types.ts`: add independent arrival/departure types and tags.
- Modify `data.ts`: populate split fields and add the `ZZMZT6343 / ZZMZT6344` extreme fixture.
- Modify `components/mockFlights.test.ts`: require complete split card data and the extreme fixture.
- Modify `components/flightTags.ts`: export the list-card color map for reuse.
- Modify `components/GanttRow.tsx`: remove old card markup and render `FlightCard`.
- Modify `App.tsx`: pass the existing flight update callback into each row.

### Task 1: Model Leg-Specific Card Data

**Files:**
- Modify: `types.ts`
- Create: `components/flightCardLayout.ts`
- Create: `components/flightCardLayout.test.ts`

- [ ] **Step 1: Write failing tests for leg fields and fallback rules**

Create `components/flightCardLayout.test.ts` with:

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import type { Flight } from '../types.ts';
import {
    addFlightTagToLeg,
    getFlightNumberSizeClass,
    getLegFlightType,
    getLegTags,
    getTagDisplay,
    getTypeVisibility,
} from './flightCardLayout.ts';

const flight = {
    id: 'edge',
    flightNo: 'ZZMZT6343',
    codeshare: 'ZZMZT6344',
    tags: ['冰'],
    flightType: 'REG',
    arrTags: ['冰', 'Q'],
    depTags: ['D'],
    arrFlightType: 'REG',
    depFlightType: 'FERRY',
    times: { sta: '09:15', std: '10:00' },
    events: [],
    annotations: [],
} satisfies Flight;

test('reads independent arrival and departure card data', () => {
    assert.deepEqual(getLegTags(flight, 'arrival'), ['冰', 'Q']);
    assert.deepEqual(getLegTags(flight, 'departure'), ['D']);
    assert.equal(getLegFlightType(flight, 'arrival'), 'REG');
    assert.equal(getLegFlightType(flight, 'departure'), 'FERRY');
});

test('falls back to legacy shared fields during migration', () => {
    const legacy = { ...flight, arrTags: undefined, depTags: undefined, arrFlightType: undefined, depFlightType: undefined };
    assert.deepEqual(getLegTags(legacy, 'arrival'), ['冰']);
    assert.deepEqual(getLegTags(legacy, 'departure'), ['冰']);
    assert.equal(getLegFlightType(legacy, 'arrival'), 'REG');
    assert.equal(getLegFlightType(legacy, 'departure'), 'REG');
});

test('shows one type when both legs match and two when they differ', () => {
    assert.deepEqual(getTypeVisibility('REG', 'REG'), { arrival: true, departure: false });
    assert.deepEqual(getTypeVisibility('REG', 'FERRY'), { arrival: true, departure: true });
});

test('shows only the existing type when one leg type is missing', () => {
    assert.deepEqual(getTypeVisibility('REG', undefined), { arrival: true, departure: false });
    assert.deepEqual(getTypeVisibility(undefined, 'FERRY'), { arrival: false, departure: true });
});

test('hides types when neither leg type exists', () => {
    assert.equal(getLegFlightType({ ...flight, flightType: undefined, arrFlightType: undefined }, 'arrival'), undefined);
    assert.deepEqual(getTypeVisibility(undefined, undefined), { arrival: false, departure: false });
});

test('keeps the add control outside tag overflow capacity', () => {
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 0 });
    assert.deepEqual(getTagDisplay(['冰', 'Q', '控', 'C', 'I'], 4), { visibleTags: ['冰', 'Q', '控'], hiddenCount: 2 });
});

test('uses compact typography at the eight-character boundary', () => {
    assert.equal(getFlightNumberSizeClass('ABC1234'), 'text-[17px]');
    assert.equal(getFlightNumberSizeClass('ABCD1234'), 'text-[12px] tracking-[-0.65px]');
    assert.equal(getFlightNumberSizeClass('ABCDEF1234'), 'text-[12px] tracking-[-0.65px]');
});

test('adds a tag only to the selected leg and synchronizes legacy detail tags', () => {
    const original = structuredClone(flight);
    const updated = addFlightTagToLeg(flight, 'departure', '控');
    assert.deepEqual(flight, original);
    assert.deepEqual(updated.arrTags, ['冰', 'Q']);
    assert.deepEqual(updated.depTags, ['D', '控']);
    assert.deepEqual(updated.tags, ['冰', 'Q', 'D', '控']);
    assert.notStrictEqual(updated.depTags, flight.depTags);
});
```

- [ ] **Step 2: Run the new test and verify RED**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="independent arrival|legacy shared|one type|one leg type is missing|neither leg type exists|tag overflow|compact typography|selected leg" components/flightCardLayout.test.ts
```

Expected: FAIL before implementation because static `flightCardLayout.ts` import and new `Flight` fields do not yet exist; missing-type cases specify showing only existing leg, or neither when both are absent.

- [ ] **Step 3: Add the leg-specific fields**

Add to `Flight` in `types.ts`:

```ts
arrTags?: string[];
depTags?: string[];
arrFlightType?: FlightType;
depFlightType?: FlightType;
```

- [ ] **Step 4: Implement minimal pure layout rules**

Create `components/flightCardLayout.ts`:

```ts
import type { Flight, FlightType } from '../types';
import { addFlightTag } from './flightTags';
import type { FlightTag } from './flightTags';

export type FlightLeg = 'arrival' | 'departure';

export const getLegTags = (flight: Flight, leg: FlightLeg): string[] =>
    (leg === 'arrival' ? flight.arrTags : flight.depTags) ?? flight.tags ?? [];

export const getLegFlightType = (flight: Flight, leg: FlightLeg): FlightType | undefined =>
    (leg === 'arrival' ? flight.arrFlightType : flight.depFlightType) ?? flight.flightType;

export const getTypeVisibility = (arrivalType: FlightType | undefined, departureType: FlightType | undefined) => {
    if (!arrivalType && !departureType) return { arrival: false, departure: false };
    if (!arrivalType) return { arrival: false, departure: true };
    if (!departureType) return { arrival: true, departure: false };
    return { arrival: true, departure: arrivalType !== departureType };
};

export const getFlightNumberSizeClass = (flightNo: string): string =>
    flightNo.length >= 8
        ? 'text-[12px] tracking-[-0.65px]'
        : 'text-[17px]';

export const getTagDisplay = (tags: string[], capacity: number) => {
    if (tags.length <= capacity) return { visibleTags: tags, hiddenCount: 0 };
    return {
        visibleTags: tags.slice(0, Math.max(0, capacity - 1)),
        hiddenCount: tags.length - Math.max(0, capacity - 1),
    };
};

export const addFlightTagToLeg = (flight: Flight, leg: FlightLeg, tag: FlightTag): Flight => {
    const arrTags = leg === 'arrival'
        ? addFlightTag(getLegTags(flight, 'arrival'), tag)
        : getLegTags(flight, 'arrival');
    const depTags = leg === 'departure'
        ? addFlightTag(getLegTags(flight, 'departure'), tag)
        : getLegTags(flight, 'departure');

    return {
        ...flight,
        arrTags,
        depTags,
        tags: Array.from(new Set([...arrTags, ...depTags])),
    };
};
```

- [ ] **Step 5: Run tests and typecheck**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="independent arrival|legacy shared|one type|one leg type is missing|neither leg type exists|tag overflow|compact typography|selected leg" components/flightCardLayout.test.ts
npm run typecheck
```

Expected: all selected tests PASS; typecheck exits 0.

- [ ] **Step 6: Commit Task 1**

```bash
git add types.ts components/flightCardLayout.ts components/flightCardLayout.test.ts
git commit -m "feat: add split flight card data model"
```

### Task 2: Populate Mock Data and Extreme Cases

**Files:**
- Modify: `data.ts`
- Modify: `components/mockFlights.test.ts`

- [ ] **Step 1: Write failing mock-data assertions**

Append to `components/mockFlights.test.ts`:

```ts
test('provides independent card metadata for every turnaround flight', () => {
    MOCK_FLIGHTS.forEach((flight) => {
        assert.ok(flight.arrTags, `${flight.flightNo} should provide arrTags`);
        assert.ok(flight.depTags, `${flight.flightNo} should provide depTags`);
        assert.ok(flight.arrFlightType, `${flight.flightNo} should provide arrFlightType`);
        assert.ok(flight.depFlightType, `${flight.flightNo} should provide depFlightType`);
    });
});

test('includes the long-flight-number card fixture', () => {
    const edgeFlight = MOCK_FLIGHTS.find(flight => flight.flightNo === 'ZZMZT6343');
    assert.ok(edgeFlight);
    assert.equal(edgeFlight?.codeshare, 'ZZMZT6344');
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="independent card metadata|long-flight-number" components/mockFlights.test.ts
```

Expected: FAIL because current mock flights use legacy shared metadata.

- [ ] **Step 3: Split every mock flight's metadata**

Add the following exact metadata to the seven fixtures:

```ts
// id 1
arrTags: ['冰', 'Q', '控', 'C'],
depTags: ['I', 'D', 'V', '互天', '机', '重要'],
arrFlightType: 'REG', depFlightType: 'REG',

// id 2
arrTags: ['V'], depTags: ['I', '控'],
arrFlightType: 'REG', depFlightType: 'REG',

// id 3
arrTags: ['D'], depTags: ['D'],
arrFlightType: 'REG', depFlightType: 'REG',

// id 4
arrTags: ['冰', 'C'], depTags: ['冰', 'C'],
arrFlightType: 'REG', depFlightType: 'REG',

// id 5
arrTags: ['Q'], depTags: ['互天'],
arrFlightType: 'REG', depFlightType: 'REG',

// id 6
arrTags: [], depTags: [],
arrFlightType: 'REG', depFlightType: 'REG',

// id 7 is replaced by the extreme fixture in Step 4
```

Keep `tags` as the unique combined list for the detail panel. Use differing arrays on at least two fixtures so both card rows are visibly testable.

- [ ] **Step 4: Convert flight 7 into the required extreme fixture**

Set:

```ts
flightNo: 'ZZMZT6343',
codeshare: 'ZZMZT6344',
arrTags: ['冰', 'Q', '控', 'C', 'I', 'D', 'V', '互天', '机', '重要'],
depTags: ['D', 'V', '互天', '机'],
tags: ['冰', 'Q', '控', 'C', 'I', 'D', 'V', '互天', '机', '重要'],
arrFlightType: 'REG',
depFlightType: 'FERRY',
```

- [ ] **Step 5: Run mock tests**

Run:

```bash
node --experimental-strip-types --test --test-name-pattern="STA and STD|independent card metadata|long-flight-number" components/mockFlights.test.ts
```

Expected: all selected tests PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add data.ts components/mockFlights.test.ts
git commit -m "test: add split flight card fixtures"
```

### Task 3: Build the Four-Row Flight Card

**Files:**
- Create: `components/FlightCard.tsx`
- Modify: `components/flightTags.ts`
- Modify: `components/GanttRow.tsx`

- [ ] **Step 1: Export the incumbent list-card color map**

Move `flightCardTagColorMap` from `GanttRow.tsx` to `components/flightTags.ts` and export it without changing values:

```ts
export const flightCardTagColorMap: Record<string, string> = {
    '冰': 'bg-blue-500',
    'Q': 'bg-blue-600',
    '控': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-red-500',
    'I': 'bg-purple-500',
    'D': 'bg-orange-500',
    'V': 'bg-teal-500',
    '互天': 'bg-cyan-600',
    '机': 'bg-indigo-500',
    '重要': 'bg-rose-600',
};
```

- [ ] **Step 2: Add type presentation and tag row primitives**

Create `components/FlightCard.tsx` with these fixed primitives:

```tsx
import React from 'react';
import { createPortal } from 'react-dom';
import type { Flight, FlightType } from '../types';
import {
    addFlightTagToLeg,
    getFlightNumberSizeClass,
    getLegFlightType,
    getLegTags,
    getTagDisplay,
    getTypeVisibility,
} from './flightCardLayout';
import type { FlightLeg } from './flightCardLayout';
import { FLIGHT_TAG_OPTIONS, flightCardTagColorMap } from './flightTags';
import type { FlightTag } from './flightTags';

const FLIGHT_TYPE_CONFIG: Record<FlightType, { label: string; className: string }> = {
    REG: { label: '正班', className: 'text-indigo-600' },
    CARGO: { label: '货班', className: 'text-purple-600' },
    EXTRA: { label: '加班', className: 'text-orange-600' },
    FERRY: { label: '调机', className: 'text-cyan-600' },
    DIV: { label: '备降', className: 'text-rose-600' },
};

const formatCardTime = (time?: string) => time && time !== '--:--' ? `${time}(05)` : '--:--';
```

Implement `FlightTypeText`, `FlightTagDot`, and `FlightTagRow`. `FlightTagRow` receives `capacity`, renders `visibleTags`, renders an `…` dot when `hiddenCount > 0`, always renders a dashed `+`, and optionally renders the video button at the far right.

- [ ] **Step 3: Implement the fixed four-row surface**

Export:

```tsx
interface FlightCardProps {
    flight: Flight;
    onClick?: () => void;
    onVideoClick?: () => void;
    onFlightUpdate?: (flight: Flight) => void;
}

export const FlightCard: React.FC<FlightCardProps> = ({
    flight,
    onClick,
    onVideoClick,
    onFlightUpdate,
}) => {
    // picker state and handlers
};
```

Use this exact surface geometry:

```tsx
<div className="sticky left-0 z-40 mr-2 w-[260px] min-w-[260px] cursor-pointer rounded-l-xl rounded-r-2xl border-y border-r border-slate-200 bg-slate-100 px-2.5 py-2 shadow-[4px_0_12px_-2px_rgba(0,0,0,0.08)]">
  <div className="grid h-[122px] grid-rows-[28px_22px_1px_28px_22px] gap-y-1">
    {/* arrival main, arrival tags, divider, departure main, departure tags + video */}
  </div>
</div>
```

Each main row uses:

```tsx
className="grid grid-cols-[69px_62px_27px_30px_minmax(28px,1fr)] items-center gap-x-[3px] whitespace-nowrap"
```

The arrival row reads `flightNo.split(' / ')[0]`, `times.sta`, `arrInfo.status`, `arrInfo.stand`, and arrival type. The departure row reads `codeshare`, `times.std`, `depInfo.status`, `depInfo.gate`, and departure type. Status and stand are plain green/blue text; no `FusedInfoBadge` remains in the card.

- [ ] **Step 4: Add the per-leg Portal tag picker**

Store `{ leg, left, top } | null`. On `+` click, stop propagation, read the button rectangle, clamp the 252px picker center inside the viewport, and render through `createPortal(..., document.body)` with `z-[200]`. Options use `FLIGHT_TAG_OPTIONS`; disable values already present in the selected leg. On selection:

```tsx
const updatedFlight = addFlightTagToLeg(flight, picker.leg, tag);
onFlightUpdate?.(updatedFlight);
setPicker(null);
```

Register only a `pointerdown` outside listener while open. Do not add Tab trapping, auto-focus, or Escape behavior.

- [ ] **Step 5: Replace the old sticky card markup in `GanttRow`**

Import `FlightCard`, add `onFlightUpdate?: (flight: Flight) => void` to `GanttRowProps`, and replace the entire old left-card `<div>` with:

```tsx
<FlightCard
    flight={flight}
    onClick={onClick}
    onVideoClick={onVideoClick}
    onFlightUpdate={onFlightUpdate}
/>
```

Delete unused `FusedInfoBadge`, `FlightTypeBadge`, `flightCardTagColorMap`, `formatFlightCardTime`, and related `FlightType` import from `GanttRow.tsx`.

- [ ] **Step 6: Run typecheck and full tests**

Run:

```bash
npm run typecheck
npm test
```

Expected: typecheck exits 0; all tests PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add components/FlightCard.tsx components/flightTags.ts components/GanttRow.tsx
git commit -m "feat: redesign flight cards by leg"
```

### Task 4: Wire Card Updates Through App State

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Pass the existing updater into every row**

Add to the `GanttRow` invocation:

```tsx
onFlightUpdate={handleFlightUpdate}
```

Do not create a second state store. `handleFlightUpdate` must remain the sole path that updates `flights` and the open `selectedFlight`.

- [ ] **Step 2: Run typecheck and focused tests**

Run:

```bash
npm run typecheck
npm test -- --test-name-pattern="selected leg|flight tag"
```

Expected: typecheck exits 0; selected tests PASS.

- [ ] **Step 3: Commit Task 4**

```bash
git add App.tsx
git commit -m "feat: persist per-leg flight tags"
```

### Task 5: Verify Layout, Extreme States, and Regression Safety

**Files:**
- Modify if defects are found: `components/FlightCard.tsx`
- Modify if defects are found: `components/flightCardLayout.ts`
- Test if logic changes: `components/flightCardLayout.test.ts`

- [ ] **Step 1: Run the complete automated check**

Run:

```bash
npm run check
git diff --check
```

Expected: typecheck, all tests, and Vite production build PASS; no whitespace errors.

- [ ] **Step 2: Start the application for one bounded visual pass**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Inspect at desktop width in one pass:

- normal six-character arrival/departure numbers;
- `ZZMZT6343 / ZZMZT6344` without clipping or wrapping;
- equal types displayed once and unequal types displayed twice;
- arrival tag overflow with `…` and persistent `+`;
- departure tags, persistent `+`, and right-aligned video button;
- tag picker above the timeline and adjacent cards;
- collapsed row remains 140px and expanded timeline rows keep their dynamic height;
- clicking `+`, a tag option, or video does not open flight details.

- [ ] **Step 3: Fix all visual defects in one batch**

Only adjust compact card grid widths, font thresholds, picker clamping, or tag capacities. If any pure rule changes, first add a failing assertion to `flightCardLayout.test.ts`, run it RED, apply the smallest fix, and rerun GREEN.

- [ ] **Step 4: Confirm with one final visual pass and rerun checks**

Run:

```bash
npm run check
git diff --check
git status -sb
```

Expected: all checks PASS; only intentional branch changes remain.

- [ ] **Step 5: Commit bounded visual corrections**

If Step 3 changed no files, record that no correction commit is required and stop. If it changed files, run:

```bash
git add components/FlightCard.tsx components/flightCardLayout.ts components/flightCardLayout.test.ts
git commit -m "fix: harden compact flight card layout"
```
