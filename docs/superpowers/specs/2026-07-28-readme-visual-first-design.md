# GitHub README 视觉优先版设计

## 目标

重写 `README.md`，把它从冗长、部分信息过时的工程说明，转变为视觉优先的项目主页。读者应在首屏快速理解项目用途、看到项目海报并进入在线演示，同时仍能在后半部分获得必要的本地运行信息。

## 受众

- 首要受众：第一次浏览 GitHub 仓库、希望快速了解产品的人。
- 次要受众：希望在本地运行项目的前端开发者。

## 内容结构

### 1. 首屏

- 项目标题：`Flight Operations Center`
- 中文副标题：`航班运行控制中心`
- 一句定位：强调用可交互时间轴呈现航班保障节点、运行偏差与关键基线。
- 展示项目海报：`public/posters/flight-ops-zine-poster.png`
- 两个主要链接：
  - 在线体验：`https://fwilyair.github.io/flight-ops-center/`
  - 源码仓库：`https://github.com/fwilyair/flight-ops-center`

首屏不堆叠大量徽章，不使用销售式 CTA，不放失效截图。

### 2. 项目简介

用一段简短中文说明项目是 React + Vite 构建的航班运行可视化前端原型，当前使用模拟数据。明确它展示的是交互与信息组织方案，避免暗示已接入真实生产数据。

### 3. 核心亮点

使用四个短模块：

1. 动态甘特时间轴：缩放、拖拽、保障节点胶囊。
2. 双基线与进程节点：放行、起飞基线及菱形节点。
3. 智能计算刻度：偏差计算、L 型虚线、悬浮提示。
4. 航班详情与协同：航班详情抽屉、备注历史、快捷短语与使用手册。

每个模块使用一到两句话，不展开成长列表。

### 4. 交互概览

用简短列表说明搜索航班、切换日期和时间比例、点击节点、查看详情、编辑备注及打开使用手册。只描述当前代码已实现的交互。

### 5. 技术栈

仅列出可由项目文件验证的内容：

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 浏览器运行时
- CSS 与 React Hooks

不再写入未安装的 Lucide React，也不沿用旧版 React 18 描述。

### 6. 本地运行

使用真实仓库地址与 npm 工作流：

```bash
git clone https://github.com/fwilyair/flight-ops-center.git
cd flight-ops-center
npm install
npm run dev
```

补充生产构建命令 `npm run build`。不承诺固定端口之外的环境行为。

### 7. 项目结构

只列出当前存在且对理解项目有帮助的文件：

- `App.tsx`
- `components/GanttRow.tsx`
- `components/Header.tsx`
- `components/FlightDetailPanel.tsx`
- `components/CapsuleDetailModal.tsx`
- `components/HelpManualModal.tsx`
- `data.ts`
- `types.ts`

不引用不存在的 `AnnotationLine.tsx` 或 `public/thumbnail.png`。

### 8. 状态说明

以简短提示说明项目为前端交互原型、数据来自本地模拟数据。README 不声明许可证，因为仓库当前没有可验证的 `LICENSE` 文件。

## 文案与视觉原则

- 中文为主，必要的产品名和技术名保留英文。
- 语气专业、克制、直接，避免“极致”“最优雅”等无法验证的营销判断。
- 标题层级清晰，但总篇幅控制在适合 GitHub 首页快速浏览的长度。
- 海报是唯一大图，不增加额外装饰图、表情堆叠或复杂徽章墙。
- 链接使用稳定的仓库路径和 GitHub Pages 地址。

## 验收标准

- README 首屏能看到标题、定位、海报和在线体验链接。
- 所有本地文件引用真实存在。
- 所有技术版本与 `package.json` 一致。
- 本地运行命令可直接复制执行。
- 不再引用缺失图片、组件、依赖或许可证。
- Markdown 链接和图片路径在 GitHub 仓库页面可正确解析。
- `npm run build` 继续成功。
