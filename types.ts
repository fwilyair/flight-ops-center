
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
  type: 'LAND' | 'IN-BLK' | 'UNLOAD' | 'ATD' | 'BOARD' | 'ARR' | 'DEP' | 'COBT';
  status: 'completed' | 'active' | 'pending' | 'delayed' | 'scheduled' | 'overtime-completed' | 'overtime-incomplete' | 'alert' | 'warning';
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
  // TODO(后端对接): 起飞和放行这两条基线的开始时间（startTime）均为 EIBT（预计入位时间），后续对接后端真实接口数据
  startTime?: string;
  endTime?: string;
  label?: string;
  style: 'solid' | 'dotted';
  color?: string;
  markers?: ProcessMarker[]; // 后端对接字段：电子进程单节点数据
}

export type FlightType = 'REG' | 'CARGO' | 'EXTRA' | 'FERRY' | 'DIV';

// 检查胶囊类型
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
  id: string; // 后端对接字段：flight_id
  flightNo: string; // 后端对接字段：flight_no
  codeshare?: string; // 后端对接字段：flight_no
  tags?: string[]; // 后端对接字段：航班标记
  remarks?: string; // 后端对接字段：航班备注
  remarksHistory?: RemarkEntry[]; // 航班历史备注记录列表
  stand?: string; // 后端对接字段：机位
  gate?: string; // 后端对接字段：登机口
  // Aircraft info
  registration?: string; // 后端对接字段：机号 e.g. B-1234
  aircraftType?: string; // 后端对接字段：机型 e.g. A320
  aircraftCategory?: string; // 后端对接字段：机类 e.g. C/D/E/F
  // Route
  route?: string; // 后端对接字段：航线 e.g. PEK-CTU-SHA
  flightType?: FlightType; // 后端对接字段：航班类型
  arrTags?: string[]; // 后端对接字段：航班标记 (进港)
  depTags?: string[]; // 后端对接字段：航班标记 (出港)
  arrFlightType?: FlightType; // 后端对接字段：航班类型 (进港)
  depFlightType?: FlightType; // 后端对接字段：航班类型 (出港)
  // Dual status support
  arrInfo?: {
    status: '前起' | '到达' | '入位' | '备降' | '延误'; // 后端对接字段：运营状态
    stand?: string; // 后端对接字段：机位
    baggageCarousel?: string; // 后端对接字段：行李转盘 e.g. 7
  };
  depInfo?: {
    status: '正常' | '允登' | '登机' | '催登' | '关闭' | '延误'; // 后端对接字段：运营状态
    gate?: string; // 后端对接字段：登机口
  };

  times: {
    // Scheduled times
    sta?: string; // 计划到达 (STA)
    std?: string; // 计划起飞 (STD)
    // Estimated times
    eta?: string; // 预计到达 (ETA)
    etd?: string; // 预计起飞 (ETD)
    // Actual times
    ata?: string; // 实际到达 (ATA)
    atd?: string; // 实际起飞 (ATD)
    // Previous leg departure
    ptd?: string; // 后端对接字段：PerATD (前站实际起飞时间)
    // Slot times
    cobt?: string; // 计算关门时间 (COBT)
    ctot?: string; // 计算起飞时间 (CTOT)
    atot?: string; // 实际起飞时间 (ATOT)
  };
  events: TimelineEvent[];
  annotations: Annotation[];
  inspections?: InspectionEvent[];
}

export const PIXELS_PER_MINUTE = 8;
export const START_TIME_HOUR = 8; // 8:00
export const START_TIME_MIN = 0;
