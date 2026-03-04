# ✈️ Flight Operations Center (SAGS) - 航班运行控制中心

![Thumbnail](./public/thumbnail.png)

一个高保真、生产级别的航班运行管控制定板前端项目，基于 React 和 Vite 构建。项目专注于直观的数据可视化和实时的甘特图时间轴追踪，旨在通过精美的浅色主题 UI 和高级交互体验，全面提升航班调度的效率与体验。

## ✨ 核心特性 / Features

- **📊 动态甘特图时间轴 (Dynamic Gantt Timeline)**:
  - 支持分钟级到小时级的平滑缩放与时间轴拖拽。
  - 动态渲染航班保障节点（如靠桥、卸载、上客、关舱门等）的时间胶囊。
  - 胶囊支持交互点击，弹出详细信息的模态框 (`CapsuleDetailModal`)。
  
- **🪪 增强型航班信息卡片 (Detailed Flight Cards)**:
  - 综合展示航班号、机号、起降机位、航班状态及延误告警。
  - **智能标签系统 (Smart Tag System)**: 使用动态彩色徽章标记航班属性（如"V", "冰", "机"等），超出空间时优雅地折叠为带有 `Hover Tooltip` 的省略号圆点。
  
- **🟢 电子进程单实时追踪 (Real-time Process Markers)**:
  - **双基线管理**: 在时间轴上同时渲染“放行”与“起飞”两条关键时间基线。
  - **菱形动态节点**: 基线上通过菱形节点追踪实时状态（进港节点为绿色，出港节点为蓝色）。
  - **防重叠算法 (Anti-overlap)**: 当节点过于密集时，自动收缩为 `20px` 的圆点，悬停时使用浮窗悬浮显示时间与详细信息节点标签，解决视觉遮挡问题。

- **⏱️ 智能基线偏差计算刻度 (Calculated Scale Points)**:
  - 自动对比航班的“放行”与“起飞”时间差，当偏差在 `0~15` 分钟内时，在时间轴上生成预判的“计算刻度点”（淡紫色紫点）。
  - 通过 L 型虚线连接实际事件的时间点与计算刻度点，为签派员提供直观的时间富裕度/紧迫度视觉参考。
  - 针对胶囊内部遮挡情况，计算刻度点会自动在 Z 轴与 Y 轴进行防遮挡提拔显示。

- **🎨 现代浅色主题美学 (Premium Light Theme UI)**:
  - 采用 Tailwind CSS 构建，融入了玻璃拟物化 (Glassmorphism) 组件设计。
  - 考究的字体排版体系（支持 `font-mono` 表盘数字及紧凑的字距）。
  - 平滑的微动画过渡 (Micro-animations) 与极致细腻的阴影反馈，告别传统 B 端系统的沉闷感。

## 🚀 技术栈 / Tech Stack

- **核心框架**: React 18, Vite
- **样式引擎**: Tailwind CSS
- **图标组件**: Lucide React
- **开发语言**: TypeScript
- **状态管理 & 交互**: React Hooks, CSS 绝对定位与基于时间的像素渲染算法 (Time-to-Pixels)

## 📦 快速开始 / Getting Started

### 环境依赖

- Node.js (v16.0 或更高版本)
- npm / yarn / pnpm

### 安装与运行

1. 克隆仓库:

   ```bash
   git clone <your-repo-url>
   ```

2. 进入项目目录:

   ```bash
   cd flight-ops-center
   ```

3. 安装依赖:

   ```bash
   npm install
   ```

4. 启动开发服务器:

   ```bash
   npm run dev
   ```

5. 在浏览器中访问 `http://localhost:3000` (或控制台提示的具体端口) 即可预览。

## 📐 核心架构 / Architecture

主要核心组件位于 `/components/` 目录下:

- **`GanttRow.tsx`**: 核心逻辑与渲染引擎。负责单行航班视图、事件胶囊 (`EventPill`)、计算刻度 (`CalcPointWithTooltip`)、以及动态排布的防重叠轨道算法处理。
- **`AnnotationLine.tsx`**: 负责渲染放行、起飞基线以及悬停自适应的菱形电子进程节点。
- **`FlightDetailPanel.tsx`**: 左侧信息展板，包含精细计算宽度的动态自适应标签组和航班基础数据。
- **`Header.tsx`**: 系统顶部导航和控制元件，包含时间刻度缩放和图例状态控制器。
- **`CapsuleDetailModal.tsx`**: 点击事件胶囊后弹出的高保真卡片信息弹窗。

静态数据模型与 Mock 数据定义在 `data.ts` 与 `types.ts`。

## 🤝 参与贡献 / Contributing

欢迎提交 Issue 和 Pull Request，我们致力于打造民航业内最优雅、最丝滑的前端交互体验。

## 📄 开源协议 / License

本项目基于 [MIT License](LICENSE) 协议开源。
