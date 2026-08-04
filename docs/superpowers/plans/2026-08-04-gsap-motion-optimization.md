# GSAP Motion Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add restrained GSAP choreography to timeline layout changes, filtering, hover guides, drawers, and modals without changing native scrolling or flight-time calculations.

**Architecture:** React remains the source of truth. A small `motion/` module owns GSAP registration, timing tokens, and reduced-motion detection; each component owns its local timeline and cleanup. GSAP Flip animates timeline layout changes, while shared modal shell code handles mounted exit animations and focus restoration.

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, GSAP Core, GSAP Flip, Tailwind browser runtime

**Required implementation skills:** Read and follow `gsap-core`, `gsap-react`, `gsap-plugins`, and `gsap-performance` before editing code. Do not add ScrollTrigger or Draggable.

---

## File map

- Create `motion/tokens.ts`: shared durations, stagger, and easing names.
- Create `motion/preferences.ts`: safe `prefers-reduced-motion` query.
- Create `motion/gsap.ts`: GSAP/Flip registration and exports.
- Create `components/MotionModalShell.tsx`: modal presence, backdrop/panel choreography, Escape handling, and focus restoration.
- Modify `package.json` and `package-lock.json`: add `gsap`.
- Modify `index.html`: global reduced-motion fallback for existing CSS animations/transitions.
- Modify `App.tsx`: time-scale Flip capture/playback, filtered-row entrance, hover-guide choreography, and video modal migration.
- Modify `components/GanttRow.tsx`: stable Flip IDs and row selectors; preserve coordinate calculations.
- Modify `components/FlightDetailPanel.tsx`: replace CSS-only drawer transition with local GSAP timeline.
- Modify `components/CapsuleDetailModal.tsx`: use `MotionModalShell` for outer modal.
- Modify `components/HelpManualModal.tsx`: use `MotionModalShell` for outer modal.
- Modify `README.md`: list GSAP/Flip and describe restrained motion/reduced-motion behavior.

## Task 1: Add GSAP and motion foundation

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `motion/tokens.ts`
- Create: `motion/preferences.ts`
- Create: `motion/gsap.ts`
- Modify: `index.html:144-181`

- [ ] **Step 1: Record the current clean build baseline**

Run:

```bash
npm run build
```

Expected: exit 0 and Vite reports a production bundle. Existing fsmonitor warnings do not count as build failures.

- [ ] **Step 2: Install GSAP through npm**

Run:

```bash
npm install gsap
```

Expected: `gsap` appears under `dependencies`; `package-lock.json` records the resolved package; no React version changes.

- [ ] **Step 3: Create shared motion tokens**

Create `motion/tokens.ts` with:

```ts
export const MOTION_DURATION = {
  fast: 0.16,
  layout: 0.36,
  modalIn: 0.3,
  modalOut: 0.2,
  drawerIn: 0.32,
  drawerOut: 0.22,
} as const;

export const MOTION_STAGGER = {
  list: 0.045,
  layer: 0.05,
} as const;

export const MOTION_EASE = {
  standard: 'power2.out',
  layout: 'power3.out',
  exit: 'power2.in',
} as const;
```

- [ ] **Step 4: Create reduced-motion detection**

Create `motion/preferences.ts` with:

```ts
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = (): boolean => {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
};
```

- [ ] **Step 5: Register and export GSAP and Flip once**

Create `motion/gsap.ts` with:

```ts
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

export { Flip, gsap };
```

- [ ] **Step 6: Add CSS reduced-motion fallback for existing animations**

Insert before the closing `</style>` in `index.html`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 7: Verify dependency and foundation compile**

Run:

```bash
npm run build
```

Expected: exit 0; no unresolved `gsap` or `gsap/Flip` imports.

- [ ] **Step 8: Commit foundation**

```bash
git add package.json package-lock.json index.html motion/tokens.ts motion/preferences.ts motion/gsap.ts
git commit -m "feat: add GSAP motion foundation"
```

## Task 2: Animate time-scale layout with Flip

**Files:**
- Modify: `components/GanttRow.tsx:73-286,332-397,789-1085`
- Modify: `App.tsx:1,34-35,145-150,242-285,404-426`

- [ ] **Step 1: Add stable layout IDs to timeline elements**

In `components/GanttRow.tsx`, add this field to the `CalcPointWithTooltip` props type:

```tsx
motionId: string;
```

Add `motionId` to the component's destructured parameters:

```tsx
({ motionId, calcRelPx, calcPointTime, calcColor, absoluteTop, onHoverChange })
```

Add these attributes to the existing roots; do not change their style calculations:

```tsx
// EventPill root
data-motion-layout
data-flip-id={`event-${event.id}`}

// CalcPointWithTooltip root
data-motion-layout
data-flip-id={`calc-${motionId}`}

// ProcessDiamond root
data-motion-layout
data-flip-id={`marker-${marker.id}`}

// GanttRow root
data-motion-flight-row
data-flight-id={flight.id}
```

At the calculated-point call site, pass:

```tsx
motionId={event.id}
```

- [ ] **Step 2: Add Flip state refs and a guarded scale-change handler**

In `App.tsx`, import `useLayoutEffect`, `Flip`, `MOTION_DURATION`, `MOTION_EASE`, and `prefersReducedMotion`. Add these refs after `scrollContainerRef`:

```tsx
const timelineLayoutRef = useRef<HTMLDivElement>(null);
const pendingFlipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);

const handleTimeScaleChange = useCallback((nextScale: 5 | 10 | 30 | 60) => {
  if (nextScale === timeScale) return;

  const scope = timelineLayoutRef.current;
  if (scope && !prefersReducedMotion()) {
    pendingFlipStateRef.current = Flip.getState(
      scope.querySelectorAll<HTMLElement>('[data-motion-layout]')
    );
  }

  setTimeScale(nextScale);
}, [timeScale]);
```

Pass `handleTimeScaleChange` to `Header` instead of `setTimeScale`.

- [ ] **Step 3: Play Flip only after React commits the new scale**

Add this layout effect in `App.tsx`:

```tsx
useLayoutEffect(() => {
  const previous = pendingFlipStateRef.current;
  if (!previous || prefersReducedMotion()) {
    pendingFlipStateRef.current = null;
    return;
  }

  const animation = Flip.from(previous, {
    duration: MOTION_DURATION.layout,
    ease: MOTION_EASE.layout,
    absolute: false,
    nested: true,
    prune: true,
    simple: true,
    overwrite: true,
  });

  pendingFlipStateRef.current = null;
  return () => animation.kill();
}, [timeScale]);
```

Attach `ref={timelineLayoutRef}` to the existing `min-w-max h-full flex flex-col relative` wrapper. Do not attach `data-motion-layout` to the red current-time line, timeline ticks, scroll container, or past-time shade.

- [ ] **Step 4: Verify layout and scroll invariants**

Run:

```bash
npm run build
npm run dev
```

Expected:

- Build exits 0.
- Switching 5/10/30/60 minute scales animates pills, calculated points, and process diamonds.
- Red line remains at 30% when auto-follow is active.
- Wheel/touch/mousedown still marks manual scroll; Space restores auto-follow.
- Repeated scale clicks replace the previous Flip animation without queued motion.

- [ ] **Step 5: Commit time-scale motion**

```bash
git add App.tsx components/GanttRow.tsx
git commit -m "feat: animate timeline scale changes"
```

## Task 3: Animate filtered flight rows

**Files:**
- Modify: `App.tsx:27-35,96-109,410-426`
- Modify: `components/GanttRow.tsx:789-797`

- [ ] **Step 1: Add a stable filter animation key**

After `filteredFlights` in `App.tsx`, add:

```tsx
const filteredFlightKey = useMemo(
  () => `${deferredSearchQuery}|${selectedDate}|${filteredFlights.map(flight => flight.id).join(',')}`,
  [deferredSearchQuery, selectedDate, filteredFlights]
);
```

- [ ] **Step 2: Add the local row entrance timeline**

Add imports for `gsap`, `MOTION_DURATION`, `MOTION_EASE`, and `MOTION_STAGGER`, then add:

```tsx
useLayoutEffect(() => {
  const scope = timelineLayoutRef.current;
  if (!scope || prefersReducedMotion()) return;

  const rows = Array.from(
    scope.querySelectorAll<HTMLElement>('[data-motion-flight-row]')
  );
  if (rows.length === 0) return;

  const context = gsap.context(() => {
    gsap.killTweensOf(rows);
    gsap.fromTo(
      rows,
      { autoAlpha: 0, y: 10 },
      {
        autoAlpha: 1,
        y: 0,
        duration: MOTION_DURATION.fast,
        ease: MOTION_EASE.standard,
        stagger: {
          each: MOTION_STAGGER.list,
          amount: Math.min(0.24, MOTION_STAGGER.list * Math.max(0, rows.length - 1)),
        },
        overwrite: true,
        clearProps: 'opacity,visibility,transform',
      }
    );

    if (deferredSearchQuery && rows[0]) {
      gsap.fromTo(
        rows[0],
        { scale: 1.012 },
        { scale: 1, duration: 0.5, ease: MOTION_EASE.standard, clearProps: 'transform' }
      );
    }
  }, scope);

  return () => context.revert();
}, [filteredFlightKey, deferredSearchQuery]);
```

Do not put `timeScale` in this effect's dependency list; scale changes belong to Flip.

- [ ] **Step 3: Verify fast input and empty results**

Run:

```bash
npm run build
```

Then type `MU`, `MU5`, and an unmatched value quickly in the running app.

Expected: latest result wins; no animation queue; unmatched search leaves zero rows without errors; clearing search restores rows with a short capped stagger.

- [ ] **Step 4: Commit row filtering motion**

```bash
git add App.tsx components/GanttRow.tsx
git commit -m "feat: choreograph filtered flight rows"
```

## Task 4: Coordinate hover badges and guide lines

**Files:**
- Modify: `App.tsx:37-42,292-325,371-402`

- [ ] **Step 1: Keep the last hover geometry mounted during exit**

Replace the current hover state and callback with:

```tsx
const [hoveredEventInfo, setHoveredEventInfo] = useState<EventHoverInfo | null>(null);
const [renderedHoverInfo, setRenderedHoverInfo] = useState<EventHoverInfo | null>(null);
const hoverMotionScopeRef = useRef<HTMLDivElement>(null);

const handleEventHover = useCallback((info: EventHoverInfo | null) => {
  if (info) setRenderedHoverInfo(info);
  setHoveredEventInfo(info);
}, []);
```

Render badges and guide lines from `renderedHoverInfo`. Keep their current `left`, `height`, and offset formulas unchanged. Add `data-motion-hover-badge` to both badges and `data-motion-hover-guide` to both guide lines. Remove their `animate-in`, `fade-in`, and `zoom-in` classes.

- [ ] **Step 2: Animate both overlay regions as one timeline**

Attach `ref={hoverMotionScopeRef}` to the outer app container and add:

```tsx
useLayoutEffect(() => {
  const scope = hoverMotionScopeRef.current;
  if (!scope || !renderedHoverInfo) return;

  const badges = scope.querySelectorAll<HTMLElement>('[data-motion-hover-badge]');
  const guides = scope.querySelectorAll<HTMLElement>('[data-motion-hover-guide]');
  const targets = [...Array.from(badges), ...Array.from(guides)];

  if (prefersReducedMotion()) {
    gsap.set(targets, { clearProps: 'all' });
    if (!hoveredEventInfo) setRenderedHoverInfo(null);
    return;
  }

  const timeline = gsap.timeline({ defaults: { overwrite: true } });
  if (hoveredEventInfo) {
    timeline
      .fromTo(guides, { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION_DURATION.fast }, 0)
      .fromTo(
        badges,
        { autoAlpha: 0, y: 4, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, duration: MOTION_DURATION.fast, ease: MOTION_EASE.standard },
        0
      );
  } else {
    timeline.to(targets, {
      autoAlpha: 0,
      duration: 0.1,
      onComplete: () => setRenderedHoverInfo(null),
    });
  }

  return () => timeline.kill();
}, [hoveredEventInfo, renderedHoverInfo]);
```

When switching directly between events, coordinates update immediately and `overwrite: true` replaces the old visual motion.

- [ ] **Step 3: Verify geometry is unchanged**

Run:

```bash
npm run build
```

Manual checks:

- Green guide still crosses the green point center.
- Purple guide still crosses the purple point center.
- Badges and guides start together.
- Rapid movement across pills leaves no stale labels or lines.
- Scrolling and scale switching preserve alignment.

- [ ] **Step 4: Commit hover choreography**

```bash
git add App.tsx
git commit -m "feat: coordinate timeline hover guides"
```

## Task 5: Animate the flight detail drawer locally

**Files:**
- Modify: `components/FlightDetailPanel.tsx:1,30-65,146-180`

- [ ] **Step 1: Add refs and a reversible drawer timeline**

Import `gsap`, motion tokens, and `prefersReducedMotion`. Add refs inside `FlightDetailPanel`:

```tsx
const backdropRef = React.useRef<HTMLDivElement>(null);
const panelRef = React.useRef<HTMLDivElement>(null);
const drawerTimelineRef = React.useRef<gsap.core.Timeline | null>(null);
```

Add this layout effect before the `if (!flight) return null` guard:

```tsx
React.useLayoutEffect(() => {
  const backdrop = backdropRef.current;
  const panel = panelRef.current;
  if (!flight || !backdrop || !panel) return;

  drawerTimelineRef.current?.kill();

  if (prefersReducedMotion()) {
    gsap.set(backdrop, { autoAlpha: isOpen ? 1 : 0 });
    gsap.set(panel, { xPercent: isOpen ? 0 : 100, autoAlpha: isOpen ? 1 : 0 });
    return;
  }

  const content = panel.querySelectorAll<HTMLElement>('[data-motion-drawer-content]');
  const timeline = gsap.timeline({ defaults: { overwrite: true } });

  if (isOpen) {
    timeline
      .to(backdrop, { autoAlpha: 1, duration: MOTION_DURATION.fast }, 0)
      .to(panel, {
        xPercent: 0,
        autoAlpha: 1,
        duration: MOTION_DURATION.drawerIn,
        ease: MOTION_EASE.layout,
      }, 0)
      .fromTo(content, { autoAlpha: 0, x: 8 }, {
        autoAlpha: 1,
        x: 0,
        duration: MOTION_DURATION.fast,
        stagger: MOTION_STAGGER.layer,
      }, 0.08);
  } else {
    timeline
      .to(panel, {
        xPercent: 100,
        autoAlpha: 0,
        duration: MOTION_DURATION.drawerOut,
        ease: MOTION_EASE.exit,
      }, 0)
      .to(backdrop, { autoAlpha: 0, duration: MOTION_DURATION.fast }, 0.04);
  }

  drawerTimelineRef.current = timeline;
  return () => timeline.kill();
}, [flight?.id, isOpen]);
```

- [ ] **Step 2: Remove competing CSS transitions and identify content layers**

Change backdrop and panel roots to use refs and pointer-event state only:

```tsx
<div
  ref={backdropRef}
  className={`fixed inset-0 bg-black/20 dark:bg-black/40 z-[35] ${isOpen ? '' : 'pointer-events-none'}`}
  onClick={onClose}
/>

<div
  ref={panelRef}
  className={`fixed right-0 w-[400px] shadow-2xl z-[70] rounded-l-2xl overflow-hidden ${isOpen ? '' : 'pointer-events-none'}`}
  // preserve existing top, height, and boxShadow style
>
```

Add `data-motion-drawer-content` to the existing main title/summary block, task list block, and remarks block. Do not mark decorative blob layers.

- [ ] **Step 3: Verify interruption and editing state**

Run `npm run build`, then:

- Open, close, and reopen the same flight rapidly.
- Switch from one flight to another while the panel is open.
- Enter remarks edit mode, close, and reopen.

Expected: no stuck transform/backdrop; latest flight content wins; existing remark reset behavior remains unchanged.

- [ ] **Step 4: Commit drawer motion**

```bash
git add components/FlightDetailPanel.tsx
git commit -m "feat: animate flight detail drawer"
```

## Task 6: Build a presence-aware modal shell

**Files:**
- Create: `components/MotionModalShell.tsx`

- [ ] **Step 1: Create the modal shell with complete enter/exit behavior**

Create `components/MotionModalShell.tsx`:

```tsx
import React from 'react';
import { gsap } from '../motion/gsap';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from '../motion/tokens';
import { prefersReducedMotion } from '../motion/preferences';

interface MotionModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  containerClassName?: string;
  backdropClassName?: string;
  panelClassName: string;
  children: React.ReactNode;
}

export const MotionModalShell: React.FC<MotionModalShellProps> = ({
  isOpen,
  onClose,
  ariaLabel,
  containerClassName = '',
  backdropClassName = 'bg-black/60 backdrop-blur-sm',
  panelClassName,
  children,
}) => {
  const [mounted, setMounted] = React.useState(isOpen);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      setMounted(true);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mounted, onClose]);

  React.useLayoutEffect(() => {
    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!mounted || !root || !backdrop || !panel) return;

    const content = panel.querySelectorAll<HTMLElement>('[data-motion-modal-content]');
    if (prefersReducedMotion()) {
      gsap.set([backdrop, panel], { clearProps: 'all' });
      if (!isOpen) {
        setMounted(false);
        previousFocusRef.current?.focus();
      } else {
        panel.focus({ preventScroll: true });
      }
      return;
    }

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { overwrite: true } });
      if (isOpen) {
        timeline
          .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: MOTION_DURATION.fast }, 0)
          .fromTo(panel, { autoAlpha: 0, y: 10, scale: 0.97 }, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: MOTION_DURATION.modalIn,
            ease: MOTION_EASE.layout,
            onStart: () => panel.focus({ preventScroll: true }),
          }, 0)
          .fromTo(content, { autoAlpha: 0, y: 6 }, {
            autoAlpha: 1,
            y: 0,
            duration: MOTION_DURATION.fast,
            stagger: MOTION_STAGGER.layer,
          }, 0.08);
      } else {
        timeline
          .to(panel, {
            autoAlpha: 0,
            y: 6,
            scale: 0.98,
            duration: MOTION_DURATION.modalOut,
            ease: MOTION_EASE.exit,
          }, 0)
          .to(backdrop, { autoAlpha: 0, duration: MOTION_DURATION.fast }, 0.02)
          .call(() => {
            setMounted(false);
            previousFocusRef.current?.focus();
          });
      }
    }, root);

    return () => context.revert();
  }, [isOpen, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={rootRef}
      className={`fixed inset-0 z-[100] flex items-center justify-center ${containerClassName}`}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div ref={backdropRef} className={`absolute inset-0 ${backdropClassName}`} onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className={panelClassName}>
        {children}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Verify shell compiles before migration**

Run `npm run build`.

Expected: exit 0; unused component is allowed; no hooks or GSAP type errors.

- [ ] **Step 3: Commit shell as an isolated unit**

```bash
git add components/MotionModalShell.tsx
git commit -m "feat: add animated modal shell"
```

## Task 7: Migrate page modals to the shell

**Files:**
- Modify: `components/CapsuleDetailModal.tsx:1,161-178`
- Modify: `components/HelpManualModal.tsx:1-24`
- Modify: `App.tsx:462-503`

- [ ] **Step 1: Migrate CapsuleDetailModal outer layer**

Import `MotionModalShell`. Replace the early guard with `if (!event) return null;`. Delete the fragment and backdrop at lines 167–172. Replace the main modal opening tag at lines 175–178 with:

```tsx
<MotionModalShell
  isOpen={isOpen}
  onClose={onClose}
  ariaLabel={`${flightNo} ${event.label}任务详情`}
  panelClassName="relative w-[700px] h-[700px] max-h-[90vh] z-[90] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
>
```

Replace its matching closing tag with:

```tsx
</MotionModalShell>
```

Keep the current two sibling nodes at `components/CapsuleDetailModal.tsx:179-367` between those tags. Add `data-motion-modal-content` to the header node at line 179 and content node at line 215. Preserve the internal control composer, its 200ms close behavior, and all lifecycle state. This task animates only the outer capsule detail modal.

- [ ] **Step 2: Migrate HelpManualModal outer layer**

Remove `if (!isOpen) return null` and import `MotionModalShell`. Delete the root and backdrop at lines 16–21. Replace the modal-container opening tag at line 24 with:

```tsx
<MotionModalShell
  isOpen={isOpen}
  onClose={onClose}
  ariaLabel="穿透管控使用手册"
  containerClassName="p-4 sm:p-6 overflow-hidden"
  panelClassName="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[570px] max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
>
```

Replace its matching closing tag with:

```tsx
</MotionModalShell>
```

Keep the current header, tab navigation, and modal body nodes at `components/HelpManualModal.tsx:26-292` between those tags. Add `data-motion-modal-content` to the three top-level nodes. Leave tab-content `animate-in` classes unchanged because internal tab changes are outside this plan.

- [ ] **Step 3: Migrate the video construction modal**

Import `MotionModalShell`. In `App.tsx`, delete the `{isVideoModalOpen && (` conditional, root container, and backdrop at lines 463–469. Replace the modal-content opening tag at line 472 with:

```tsx
<MotionModalShell
  isOpen={isVideoModalOpen}
  onClose={handleVideoModalClose}
  ariaLabel="监控视频"
  panelClassName="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[400px] overflow-hidden"
>
```

Replace the old modal closing tags and conditional close with:

```tsx
</MotionModalShell>
```

Keep the current header and body nodes at `App.tsx:474-500` between those tags. Add `data-motion-modal-content` to both nodes. Remove their competing `animate-in` classes.

- [ ] **Step 4: Verify modal behavior and accessibility**

Run `npm run build`, then manually check each modal:

- Open and close using trigger, backdrop, close button, and Escape.
- Reopen during exit; latest open state must win.
- Focus moves into the modal immediately and returns to the trigger after close.
- Help tabs, capsule controls, and video close button still work.
- reduced-motion mode removes waiting while keeping focus behavior.

- [ ] **Step 5: Commit modal migrations**

```bash
git add App.tsx components/CapsuleDetailModal.tsx components/HelpManualModal.tsx
git commit -m "feat: choreograph page modals"
```

## Task 8: Document and run full regression

**Files:**
- Modify: `README.md:46-54`

- [ ] **Step 1: Update the technical stack and motion behavior**

Under `## 技术栈`, add:

```markdown
- GSAP Core 与 Flip：用于时间轴布局过渡、列表编排和浮层进入退出
```

After the stack list, add:

```markdown
页面保留浏览器原生滚动；GSAP 不接管时间轴滚轮、拖拽或当前时间定位。系统遵循 `prefers-reduced-motion`，在减少动态效果模式下直接呈现最终状态。
```

- [ ] **Step 2: Run production verification**

Run:

```bash
npm run build
git diff --check
```

Expected: both commands exit 0; no TypeScript errors, unresolved GSAP imports, or whitespace errors.

- [ ] **Step 3: Run interaction regression matrix**

Start `npm run dev` and verify:

1. Scale: switch 5 → 10 → 30 → 60 → 5 rapidly.
2. Scroll: wheel away, wait over 500ms, confirm auto-follow stays disabled; press Space and confirm red line returns to 30%.
3. Search: type partial match, exact match, unmatched text, then clear quickly.
4. Hover: cross normal and calculated points rapidly before and after horizontal scroll.
5. Drawer: open same flight twice, switch flights, edit remarks, close and reopen.
6. Modals: open/close Capsule, Help, and Video through all supported controls.
7. Accessibility: repeat drawer/modal checks with reduced motion enabled and keyboard-only input.

Expected: every final UI state matches React state; no stale inline transforms, invisible click blockers, queued motion, drifting time line, or console errors.

- [ ] **Step 4: Inspect motion performance**

Use browser Performance panel during a scale switch and search reset.

Expected: motion primarily updates transform/opacity; no continuous layout read loop; timeline duration stays capped when all rows return.

- [ ] **Step 5: Commit documentation and final verification state**

```bash
git add README.md
git commit -m "docs: describe GSAP motion behavior"
```

- [ ] **Step 6: Confirm branch contains only intended commits**

Run:

```bash
git status --short --branch
git log --oneline main..HEAD
```

Expected: implementation files are clean; pre-existing unrelated untracked paths remain untouched; branch log contains the design commit plus the task commits above.
