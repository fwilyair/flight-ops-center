# 航班运行中心 - 后端数据接口与字段映射规范表

> 📌 **对接状态**：已完成用户后端映射规则对齐，对应 JSDoc 代码注释已同步添加至 `types.ts` 和 `data.ts`。

---

## 一、 航班主体数据 (`Flight`)

用于渲染左侧固定航班信息卡片（Flight Card）及详情弹窗。

| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | 航班唯一标识符 | `"1"` | `flight_id` |
| `flightNo` | `string` | 进港/主航班号 | `"CA1538"` | `flight_no` |
| `codeshare` | `string` | 出港/共享航班号 | `"CA1539"` | `flight_no` |
| `stand` | `string` | 停机位 | `"203"` | `机位` |
| `registration` | `string` | 飞机机号 | `"B-6789"` | `机号` |
| `aircraftType` | `string` | 机型 | `"A320"` | `机型` |
| `aircraftCategory`| `string` | 机类 (C/D/E/F) | `"C"` | `机类` |
| `route` | `string` | 航线 | `"PEK-CTU-SHA"` | `航线` |
| `arrFlightType` | `'REG' \| 'CARGO' \| 'EXTRA' \| 'FERRY' \| 'DIV'` | 进港航班类型 (正班/货班/加班/包机/备降) | `"REG"` | `航班类型` |
| `depFlightType` | `'REG' \| 'CARGO' \| 'EXTRA' \| 'FERRY' \| 'DIV'` | 出港航班类型 | `"REG"` | `航班类型` |
| `tags` | `string[]` | 航班全局标签组合 | `["冰", "Q", "控"]` | `航班标记` |
| `arrTags` | `string[]` | 进港专用标签 | `["冰", "Q"]` | `航班标记` |
| `depTags` | `string[]` | 出港专用标签 | `["控", "C"]` | `航班标记` |
| `remarks` | `string` | 航班最新备注 | `"VIP航班待确认"` | `航班备注` |
| `remarksHistory`| `RemarkEntry[]`| 航班历史备注记录列表 | (数组) | `航班历史备注` |

### 1.1 进港卡片数据 (`arrInfo`)
| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `arrInfo.status` | `'前起' \| '到达' \| '入位' \| '备降' \| '延误'` | 进港运行状态 | `"到达"` | `运营状态` |
| `arrInfo.stand` | `string` | 进港机位 | `"243"` | `机位` |
| `arrInfo.baggageCarousel` | `string` | 行李转盘编号 | `"7"` | `行李转盘` |

### 1.2 出港卡片数据 (`depInfo`)
| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `depInfo.status` | `'正常' \| '允登' \| '登机' \| '催登' \| '关闭' \| '延误'` | 出港运行状态 | `"正常"` | `运营状态` |
| `depInfo.gate` | `string` | 登机口 | `"15"` | `登机口` |

---

## 二、 航班时间节点集 (`Flight.times`)

控制时间轴上绿点、紫点、卡片关键时刻的定位。

| 前端字段名 | 时间格式 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `sta` | `HH:MM` | STA | `"09:15"` | `STA` (计划到达) |
| `eta` | `HH:MM` | ETA | `"09:00"` | `ETA` (预计到达) |
| `ata` | `HH:MM` | ATA | `"09:02"` | `ATA` (实际到达) |
| `std` | `HH:MM` | STD | `"10:45"` | `STD` (计划起飞) |
| `etd` | `HH:MM` | ETD | `"10:50"` | `ETD` (预计起飞) |
| `atd` | `HH:MM` | ATD | `"10:48"` | `ATD` (实际起飞) |
| `ptd` | `HH:MM` | PerATD | `"07:30"` | `PerATD` (前站实际起飞时间) |
| `cobt` | `HH:MM` | COBT | `"10:20"` | `COBT` (计算关门时间) |
| `ctot` | `HH:MM` | CTOT | `"10:35"` | `CTOT` (计算起飞时间) |
| `atot` | `HH:MM` | ATOT | `"10:48"` | `ATOT` (实际起飞时间) |

---

## 三、 四项保障检查数据 (`InspectionEvent`)

控制抽屉中 `入` (入位检查)、`登` (登机检查)、`推` (推出检查)、`允` (允许登机) 4 个动作按钮的状态与弹窗数据。

| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | 检查项唯一标识 | `"1-insp-1"` | `inspection_id` |
| `type` | `'入位检查' \| '允许登机' \| '登机检查' \| '推出检查'` | 四项检查类型名称 | `"入位检查"` | `inspection_type` |
| `timeScheduled` | `HH:MM` | 计划保障节点时间 | `"09:20"` | `time_scheduled` |
| `timeActual` | `HH:MM` | 实际操作/确认时间 (`--:--` 表示未操作) | `"09:18"` | `time_actual` |
| `operator` | `string` | 操作员账号/姓名 | `"张三"` | `operator` |
| `status` | `'pending' \| 'completed' \| 'overtime-completed' \| 'overtime-incomplete'` | 4 种按钮状态 (未操作/正常完成/超时完成/超时未完成) | `"completed"` | `status` |

---

## 四、 任务保障胶囊数据 (`TimelineEvent` & `TaskLifecycleEvent`)

甘特图区域渲染的任务胶囊与弹窗生命周期。

| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | 任务胶囊唯一标识 | `"e1"` | `event_id` |
| `label` | `string` | 任务名称 (如: 开客舱门) | `"开客舱门"` | `event_name` |
| `timeScheduled` | `HH:MM` | 计划执行时刻 | `"09:50"` | `time_scheduled` |
| `timeActual` | `HH:MM` | 实际执行时刻 | `"10:00"` | `time_actual` |
| `type` | `'LAND' \| 'IN-BLK' \| 'UNLOAD' \| 'ATD' \| 'BOARD' \| 'ARR' \| 'DEP' \| 'COBT'` | 任务事件类型枚举 | `"IN-BLK"` | `event_type` |
| `status` | `'completed' \| 'active' \| 'pending' \| 'delayed' \| 'scheduled' \| 'overtime-completed' \| 'overtime-incomplete' \| 'alert' \| 'warning'` | 胶囊框线与颜色状态 (未管控/已管控未回执/已管控已回执) | `"overtime-completed"` | `status` |
| `taskStatus` | `'未发布' \| '已发布' \| '已领受' \| '到位' \| '开始' \| '结束'` | 任务推进状态 | `"结束"` | `task_status` |
| `department` | `string` | 保障责任部门 | `"机务保障"` | `department` |
| `personnel` | `string[]` | 保障责任人员列表 | `["张三", "李四"]` | `personnel` |
| `isDimmed` | `boolean` | 右键置灰弱化状态 (可控/可消除) | `false` | `is_dimmed` |

---

## 五、 基线与电子进程单数据 (`Annotation` & `ProcessMarker`)

行底部起飞与放行两条基线及电子进程单事件节点。

| 前端字段名 | 数据类型 | 前端当前用途 / 含义 | 示例值 | 后端对接字段 / 接口 / 逻辑说明 |
| :--- | :--- | :--- | :--- | :--- |
| `label` | `string` | 基线类型名称 | `"放行"` / `"起飞"` | `baseline_type` |
| `startTime` | `HH:MM` | **基线开始时间** (两条基线起点均为 EIBT) | `"09:00"` | `EIBT` (预计入位时间) |
| `endTime` | `HH:MM` | **基线结束时间** | `"10:15"` | `endTime` |
| `style` | `'solid' \| 'dotted'` | 基线线段样式 (实线/虚线) | `"solid"` | `line_style` |
| `markers` | `ProcessMarker[]` | 基线上挂载的电子进程单节点列表 | (数组) | `电子进程单` |
