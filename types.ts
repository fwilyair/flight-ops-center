
// Task lifecycle event for timeline display
export interface TaskLifecycleEvent {
  id: string;
  type: '创建' | '发布' | '领受' | '到位' | '开始' | '结束' | '预警' | '催办' | '管控';
  timestamp: string; // ISO format or "MM-DD HH:mm"
  description: string;
}

// Task status for capsule modal
export type TaskStatus = '未发布' | '已发布' | '已领受' | '到位' | '开始' | '结束';

export interface TimelineEvent {
  id: string;
  label: string;
  timeActual: string; // HH:MM
  timeScheduled?: string; // HH:MM
  type: 'LAND' | 'IN-BLK' | 'UNLOAD' | 'ATD' | 'BOARD' | 'ARR' | 'DEP' | 'COBT' | 'STA' | 'STD';
  status: 'completed' | 'active' | 'pending' | 'delayed' | 'scheduled' | 'normal' | 'overtime-completed' | 'overtime-incomplete' | 'alert' | 'warning';
  // Extended fields for capsule modal
  taskStatus?: TaskStatus;
  department?: string;
  personnel?: string[];
  lifecycle?: TaskLifecycleEvent[];
  isDimmed?: boolean; // 新增：是否已弱化显示
}

export interface ProcessMarker {
  id: string;
  label: string;       // e.g. '落地', '滑行', '入位'
  shortLabel?: string; // e.g. '开' for '推出开车'
  time: string;        // HH:MM format
  phase: 'arrival' | 'departure';
}

export interface Annotation {
  type: 'connector' | 'label';
  startEventId?: string; // if connecting from an event
  endEventId?: string;   // if connecting to an event, or strictly time based
  startTime?: string;
  endTime?: string;
  label?: string;
  style: 'solid' | 'dotted';
  color?: string;
  markers?: ProcessMarker[]; // Electronic process sheet markers on this baseline
}

export type FlightType = 'REG' | 'CARGO' | 'EXTRA' | 'FERRY' | 'DIV';

// 检查胶囊类型（管控视图：精简名称为 入位、允登、登控、推出）
export type InspectionType = '入位' | '允登' | '登控' | '推出' | '入位检查' | '允许登机' | '登机检查' | '推出检查';

// 检查胶囊数据
export interface InspectionEvent {
  id: string;
  type: InspectionType;
  timeScheduled: string;   // HH:MM — 计划时间
  timeActual: string;      // HH:MM 或 '--:--'（未操作）
  operator?: string;       // 操作人账号 ID，如 '张三'
  status: 'pending' | 'completed' | 'overtime-completed' | 'overtime-incomplete';
  referenceTimes?: Record<string, string>;  // 参考时间键值对（值为 HH:MM 或 '--:--'）
}

export interface RemarkEntry {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

export interface Flight {
  id: string;
  flightNo: string;
  codeshare?: string;
  tags?: string[]; // New field for flight tags (e.g., '冰', 'Q', '控')
  remarks?: string; // Current/Latest remark (Legacy)
  remarksHistory?: RemarkEntry[]; // New field for flight remarks history
  stand?: string;
  gate?: string;
  // Aircraft info
  registration?: string; // 机号 e.g. B-1234
  aircraftType?: string; // 机型 e.g. A320
  aircraftCategory?: string; // 机类 e.g. M/H/J
  // Route
  route?: string; // 航线 e.g. CTU-PEK
  flightType?: FlightType;
  arrTags?: string[];
  depTags?: string[];
  arrFlightType?: FlightType;
  depFlightType?: FlightType;
  // Dual status support
  arrInfo?: {
    status: '正常' | '前起' | '到达' | '入位' | '备降' | '延误';
    stand?: string;
    baggageCarousel?: string; // 行李转盘 e.g. 7
  };
  depInfo?: {
    status: '正常' | '允登' | '登机' | '催登' | '关闭' | '延误';
    gate?: string;
  };

  times: {
    // Scheduled times
    sta?: string; // 计划到达
    std?: string; // 计划起飞
    // Estimated times
    eta?: string; // 预计到达
    etd?: string; // 预计起飞
    // Actual times
    ata?: string; // 实际到达
    atd?: string; // 实际起飞
    // Previous leg departure
    ptd?: string; // 前站起飞
    // Slot times
    cobt?: string; // COBT
    ctot?: string; // CTOT
    atot?: string; // ATOT
  };
  events: TimelineEvent[];
  annotations?: Annotation[];
  inspections?: InspectionEvent[]; // 检查胶囊（管控视图）
}

export const PIXELS_PER_MINUTE = 8;
export const START_TIME_HOUR = 8; // 8:00
export const START_TIME_MIN = 0;
