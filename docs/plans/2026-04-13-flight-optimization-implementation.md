# 航班运行中心优化实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 优化航班延误识别逻辑、术语表达，并增加胶囊右键“弱化”交互。

**Architecture:** 采用方案一（组件逻辑驱动），通过修改 `GanttRow` 内部状态识别延误标记，并实现自定义右键菜单控制胶囊视觉状态。

**Tech Stack:** React, TypeScript, Tailwind CSS.

---

### Task 1: 类型定义与文案替换

**Files:**
- Modify: `types.ts`
- Modify: `components/CapsuleDetailModal.tsx`

**Step 1: 更新 TimelineEvent 类型**
在 `types.ts` 的 `TimelineEvent` 接口中增加 `isDimmed?: boolean`。

```typescript
export interface TimelineEvent {
  // ... existing fields
  isDimmed?: boolean; // 新增：是否已弱化显示
}
```

**Step 2: 替换 CapsuleDetailModal 中的术语**
将“发送管控”替换为“多级管控”，将“发送催办”替换为“穿透管控”。

**Step 3: 提交**
```bash
git add types.ts components/CapsuleDetailModal.tsx
git commit -m "feat: update types and labels for multi-level control"
```

---

### Task 2: 延误航班识别与左侧背景优化

**Files:**
- Modify: `components/GanttRow.tsx`

**Step 1: 修改 isDelay 逻辑**
在 `GanttRow` 组件内，将 `isDelay` 的判断条件改为包含 “D” 标记。

```typescript
const isDelay = flight.tags?.includes('D') || flight.arrInfo?.status === '延误' || flight.depInfo?.status === '延误';
```

**Step 2: 应用背景色与状态强制同步**
1. 在左侧 `sticky` 容器的 `style` 中，根据 `isDelay` 切换背景色。
2. 在渲染 `FusedInfoBadge` 时，若 `isDelay` 为真且带 `D` 标，确保其 status 传入“延误”。

**Step 3: 运行并验证视觉效果**
确保带 'D' 标记的航班（如 ID 为 3 的 CZ6892）左侧变粉。

**Step 4: 提交**
```bash
git add components/GanttRow.tsx
git commit -m "feat: implement delay identification and pink background for D-tagged flights"
```

---

### Task 3: 胶囊右键交互与弱化效果实现

**Files:**
- Modify: `components/GanttRow.tsx`

**Step 1: 增加弱化状态管理**
在 `GanttRow` 中增加 `dimmedEventIds` 状态。

```typescript
const [dimmedEventIds, setDimmedEventIds] = React.useState<Set<string>>(new Set());
const toggleDimmed = (id: string) => {
    setDimmedEventIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });
};
```

**Step 2: 实现自定义右键菜单**
1. 在 `GanttRow` 中添加 `ContextMenu` 组件及相关位置计算逻辑。
2. 为 `EventPill` 绑定 `onContextMenu`。

**Step 3: 应用视觉弱化样式**
在 `EventPill` 的容器中，判断 `dimmedEventIds.has(event.id)`，若为真，应用 `opacity-40 grayscale-[80%]`。

**Step 4: 最终验收与 Commit**
```bash
git add components/GanttRow.tsx
git commit -m "feat: add capsule right-click context menu and weakness effect"
```
