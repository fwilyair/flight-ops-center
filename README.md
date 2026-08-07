<div align="center">
  <img src="./public/logo.png" height="48" alt="Flight Control Center logo" />

  # Flight Control Center

  **航班控制中心**

  把航班保障节点、运行偏差与关键基线，放进一条可以缩放、拖拽与穿透查看的时间轴。

  [**在线体验**](https://fwilyair.github.io/flight-ops-center/) · [查看源码](https://github.com/fwilyair/flight-ops-center)
</div>

## 关于项目

Flight Control Center 是一个面向航班运行场景的交互式可视化前端原型。它使用甘特时间轴组织航班保障事件，在同一视图中呈现计划时间、实际时间、关键基线、偏差预判和运行告警，帮助使用者更快理解一架航班当前发生了什么、接下来将发生什么。

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
- GSAP Core 与 Flip：用于时间轴布局过渡、列表编排和浮层进入退出
- React Hooks、CSS 动画与基于时间的像素布局

页面保留浏览器原生滚动；GSAP 不接管时间轴滚轮、拖拽或当前时间定位。系统遵循 `prefers-reduced-motion`，在减少动态效果模式下直接呈现最终状态。

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
    └── logo.png
```

## 项目状态

这是一个前端交互原型，数据来自仓库内的模拟数据，尚未连接真实航班运行系统或生产接口。
