# Visual-First README Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the outdated repository README with a concise visual-first GitHub project page that leads with the poster and live demo.

**Architecture:** Keep all reader-facing documentation in the root `README.md`. Use repository-relative image paths and verified GitHub URLs so the same document renders correctly on GitHub without generated badges or external image services.

**Tech Stack:** GitHub Flavored Markdown, repository-local PNG assets, npm/Vite validation

---

### Task 1: Replace the README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the complete file**

Use this exact content:

```markdown
<div align="center">
  <img src="./public/logo.png" height="48" alt="Flight Operations Center logo" />

  # Flight Operations Center

  **航班运行控制中心**

  把航班保障节点、运行偏差与关键基线，放进一条可以缩放、拖拽与穿透查看的时间轴。

  [**在线体验**](https://fwilyair.github.io/flight-ops-center/) · [查看源码](https://github.com/fwilyair/flight-ops-center)
</div>

<div align="center">
  <img src="./public/posters/flight-ops-zine-poster.png" width="560" alt="Flight Operations Center — Every Minute Has a Heading" />
</div>

## 关于项目

Flight Operations Center 是一个面向航班运行场景的交互式可视化前端原型。它使用甘特时间轴组织航班保障事件，在同一视图中呈现计划时间、实际时间、关键基线、偏差预判和运行告警，帮助使用者更快理解一架航班当前发生了什么、接下来将发生什么。

当前版本使用本地模拟数据，重点展示信息组织方式、时间轴交互和运行协同体验。

## 核心亮点

| 模块 | 能力 |
| --- | --- |
| **动态甘特时间轴** | 支持时间比例切换、横向拖拽与保障节点胶囊展示，在分钟级时间线上观察航班进程。 |
| **双基线与进程节点** | 同时呈现放行、起飞基线与菱形节点，并处理密集节点的错位和悬浮说明。 |
| **智能计算刻度** | 根据运行偏差生成计算点，以 L 型虚线连接原始时间与预判时间，直观呈现时间余量。 |
| **航班详情与协同** | 支持航班详情抽屉、保障时间表、备注历史、快捷短语、监控入口和内置使用手册。 |

## 可以怎么操作

- 按航班号搜索并按日期筛选航班
- 在 5 分钟、10 分钟、30 分钟和 1 小时时间比例间切换
- 点击时间胶囊查看节点详情
- 点击航班卡片打开详情抽屉并维护备注
- 悬停查看基线节点、计算点和运行偏差信息
- 通过顶部入口打开图例与使用手册

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 浏览器运行时
- React Hooks、CSS 动画与基于时间的像素布局

## 本地运行

```bash
git clone https://github.com/fwilyair/flight-ops-center.git
cd flight-ops-center
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

## 项目结构

```text
.
├── App.tsx
├── components/
│   ├── GanttRow.tsx
│   ├── Header.tsx
│   ├── FlightDetailPanel.tsx
│   ├── CapsuleDetailModal.tsx
│   └── HelpManualModal.tsx
├── data.ts
├── types.ts
├── index.tsx
└── public/
    ├── logo.png
    └── posters/
        └── flight-ops-zine-poster.png
```

## 项目状态

这是一个前端交互原型，数据来自仓库内的模拟数据，尚未连接真实航班运行系统或生产接口。
```

### Task 2: Validate documentation references

**Files:**
- Test: `README.md`
- Verify: `public/logo.png`
- Verify: `public/posters/flight-ops-zine-poster.png`
- Verify: `components/GanttRow.tsx`
- Verify: `components/Header.tsx`
- Verify: `components/FlightDetailPanel.tsx`
- Verify: `components/CapsuleDetailModal.tsx`
- Verify: `components/HelpManualModal.tsx`

- [ ] **Step 1: Check every local path**

Run:

```bash
for file in \
  public/logo.png \
  public/posters/flight-ops-zine-poster.png \
  components/GanttRow.tsx \
  components/Header.tsx \
  components/FlightDetailPanel.tsx \
  components/CapsuleDetailModal.tsx \
  components/HelpManualModal.tsx \
  data.ts types.ts index.tsx; do
  test -e "$file" || exit 1
done
```

Expected: exit code `0` with no missing files.

- [ ] **Step 2: Check removed invalid claims**

Run:

```bash
rg -n "thumbnail\\.png|AnnotationLine|Lucide|React 18|MIT License|LICENSE" README.md
```

Expected: exit code `1` and no matches.

### Task 3: Validate the project

**Files:**
- Test: `README.md`
- Test: application build

- [ ] **Step 1: Check Markdown whitespace and Git diff**

Run:

```bash
git diff --check
```

Expected: exit code `0`.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Vite reports a successful build and exits with code `0`.

### Task 4: Publish the README

**Files:**
- Commit: `README.md`
- Commit: `docs/superpowers/plans/2026-07-28-readme-visual-first.md`

- [ ] **Step 1: Commit the plan**

```bash
git add docs/superpowers/plans/2026-07-28-readme-visual-first.md
git commit -m "docs: plan visual-first README"
```

- [ ] **Step 2: Commit the README**

```bash
git add README.md
git commit -m "docs: rewrite project README"
```

- [ ] **Step 3: Push main**

```bash
git push origin main
```

Expected: Git reports `main -> main`.

- [ ] **Step 4: Confirm local and remote main match**

Run:

```bash
git fetch origin main
test "$(git rev-parse main)" = "$(git rev-parse origin/main)"
```

Expected: exit code `0`.
