# Hover Guide Dot Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将绿色和紫色悬浮纵向虚线水平校正到各自圆点中心，同时不移动其他时间轴元素。

**Architecture:** 悬浮引导线继续由 `App.tsx` 的航班行覆盖层统一绘制。将当前仅包含 260px 固定列宽的坐标原点，校正为航班行中真实时间轴起点：1px 行边框 + 260px 固定列 + 8px 右外边距，共 269px；绿线和紫线共用该常量。

**Tech Stack:** React 19、TypeScript、Tailwind CSS、Vite 6

---

### Task 1: 校正悬浮引导线坐标

**Files:**
- Modify: `App.tsx:11-13,369-398`
- Verify: `components/GanttRow.tsx:790-806`

- [x] **Step 1: 确认现有布局偏移来源**

核对 `GanttRow` 外层的 1px 边框、固定信息列 `w-[260px]` 和 `mr-2`（8px），预期真实时间轴起点为 `1 + 260 + 8 = 269px`。

- [x] **Step 2: 添加共享的引导线时间轴偏移常量**

在 `App.tsx` 的组件定义前添加：

```tsx
const HOVER_GUIDE_TIMELINE_OFFSET_PX = 269;
```

- [x] **Step 3: 将绿色和紫色虚线改用真实时间轴起点**

把两处 `260 + ...DotPx` 改为：

```tsx
left: `${HOVER_GUIDE_TIMELINE_OFFSET_PX + hoveredEventInfo.greenDotPx}px`,
```

```tsx
left: `${HOVER_GUIDE_TIMELINE_OFFSET_PX + hoveredEventInfo.purpleDotPx}px`,
```

不改动虚线高度、样式、圆点、胶囊、顶部时间标签或当前时间红线。

- [x] **Step 4: 运行生产构建**

Run: `npm run build`

Expected: Vite 构建成功，TypeScript/JSX 没有错误，命令以状态码 0 结束。

- [x] **Step 5: 进行视觉验证**

启动本地页面，悬浮有普通计划点和紫色计算点的任务胶囊，确认绿色虚线穿过绿点中心、紫色虚线穿过紫点中心；切换时间刻度并横向滚动后仍保持对齐。

- [x] **Step 6: 提交实现**

```bash
git add App.tsx docs/superpowers/plans/2026-08-03-hover-guide-dot-alignment.md
git commit -m "fix: align hover guides with timeline dots"
```
