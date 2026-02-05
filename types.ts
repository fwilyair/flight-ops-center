
export interface TimelineEvent {
  id: string;
  label: string;
  timeActual: string; // HH:MM
  timeScheduled?: string; // HH:MM
  type: 'LAND' | 'IN-BLK' | 'UNLOAD' | 'ATD' | 'BOARD' | 'ARR' | 'DEP' | 'COBT';
  status: 'completed' | 'active' | 'pending' | 'delayed' | 'scheduled' | 'overtime-completed' | 'overtime-incomplete' | 'alert' | 'warning';
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
}

export type FlightType = 'REG' | 'CARGO' | 'EXTRA' | 'FERRY' | 'DIV';

export interface Flight {
  id: string;
  flightNo: string;
  codeshare?: string;
  stand?: string;
  gate?: string;
  // Aircraft info
  registration?: string; // 机号 e.g. B-1234
  aircraftType?: string; // 机型 e.g. A320
  aircraftCategory?: string; // 机类 e.g. M/H/J
  // Route
  route?: string; // 航线 e.g. CTU-PEK
  flightType?: FlightType;
  // Dual status support
  arrInfo?: {
    status: '前起' | '到达' | '入位' | '备降' | '延误';
    stand?: string;
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
  };
  events: TimelineEvent[];
  annotations: Annotation[];
}

export const PIXELS_PER_MINUTE = 8;
export const START_TIME_HOUR = 8; // 8:00
export const START_TIME_MIN = 0;
