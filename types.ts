
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
    // For Gantt/Calculations (keeping existing useful ones)
    std?: string;
    etd?: string;
    cobt?: string;
    atd?: string;
    sta?: string;
    eta?: string;
  };
  events: TimelineEvent[];
  annotations: Annotation[];
}

export const PIXELS_PER_MINUTE = 8;
export const START_TIME_HOUR = 14; // 14:00
export const START_TIME_MIN = 0;
