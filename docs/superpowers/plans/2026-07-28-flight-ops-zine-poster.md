# Flight Ops Zine Poster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate and save one vertical Minimal Zine Poster v0.1 bitmap for the Flight Operations Center project.

**Architecture:** Compile the approved design into one four-paragraph Standard Mode image prompt, generate one raster image with the built-in image tool, then validate the rendered composition and color anchor before saving it into the project. Regenerate at most once, changing only the failed visual requirement.

**Tech Stack:** Minimal Zine Poster v0.1 prompt compiler, built-in image generation, local image inspection

---

### Task 1: Compile the final prompt

**Files:**
- Read: `docs/superpowers/specs/2026-07-28-flight-ops-zine-poster-design.md`

- [ ] **Step 1: Select the fixed variation recipe**

Use `single-specimen / flat silhouette / short phrase pressed against image edge / fully saturated cobalt / risograph grain / quiet`.

- [ ] **Step 2: Compile the prompt**

Write exactly four compact paragraphs in this order:

1. Vertical 3:5 aged-paper canvas, 82% negative space, one lower-middle cluster occupying about 15%.
2. A horizontal aircraft silhouette crossing a thin archival time ruler, treated as a paper print specimen.
3. The exact phrase `EVERY MINUTE HAS A HEADING.`, sparse archive microtext, and fully saturated cobalt-blue risograph ink occupying about 1.5%–2.2% of the canvas.
4. Flat orthographic scan mood and the complete avoid list from the approved design.

### Task 2: Generate the poster

**Files:**
- Create: `public/posters/flight-ops-zine-poster.png`

- [ ] **Step 1: Generate one raster image**

Use the built-in image generation tool with the compiled prompt. Do not pass reference images.

- [ ] **Step 2: Save the selected output**

Copy the generated bitmap into `public/posters/flight-ops-zine-poster.png` without overwriting any existing poster.

### Task 3: Validate the visual result

**Files:**
- Inspect: `public/posters/flight-ops-zine-poster.png`

- [ ] **Step 1: Inspect the full image and thumbnail behavior**

Confirm all of the following:

- vertical paper poster with 70%–90% empty paper
- one lower-middle visual cluster occupying 8%–25%
- clear aircraft-and-time-ruler metaphor
- one saturated cobalt anchor visible at thumbnail size
- flat scanned-paper appearance with no mockup or 3D depth
- no commercial CTA, logo lockup, neon, cartoon, dense collage, or long text

- [ ] **Step 2: Regenerate only if a hard requirement fails**

If the cobalt anchor is washed out or too small, strengthen only its saturation and occupied area. If the composition is too dense, reduce secondary typography. Make at most one regeneration.

### Task 4: Deliver the artifact

**Files:**
- Report: `public/posters/flight-ops-zine-poster.png`

- [ ] **Step 1: Return the generated image inline**

Show the saved poster using its absolute project path.

- [ ] **Step 2: Return generation metadata**

Include the final four-paragraph prompt, Standard Mode, the fixed variation recipe, and one sentence explaining the “time has a heading” metaphor.
