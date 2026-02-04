import { Flight } from './types';

// Generate 20 mock flights
export const MOCK_FLIGHTS: Flight[] = [
  // 1. 进港已完成 - 2个事件
  {
    id: '1',
    flightNo: 'CA1538',
    codeshare: 'CA1539',
    arrInfo: {
      status: '到达',
      stand: '243'
    },
    depInfo: {
      status: '正常',
      gate: '15'
    },
    times: {
      sta: '20:15',
      eta: '20:00',
      cobt: '20:00'
    },
    events: [
      { id: 'e1', label: '落地', type: 'LAND', timeActual: '20:00', timeScheduled: '20:00', status: 'overtime-completed' },
      { id: 'e2', label: '靠桥', type: 'IN-BLK', timeActual: '20:25', timeScheduled: '20:15', status: 'overtime-completed' },
    ],
    annotations: [
      { type: 'connector', startTime: '20:00', endTime: '21:00', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '21:00', endTime: '22:00', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 2. 过站 - 4个事件
  {
    id: '2',
    flightNo: 'MU5206',
    codeshare: 'MU5207',
    // Dual status for Turnaround
    arrInfo: {
      status: '入位',
      stand: '317L'
    },
    depInfo: {
      status: '登机',
      gate: '32'
    },
    times: {
      sta: '20:40',
      std: '22:00',
      cobt: '20:30'
    },
    events: [
      { id: 'e3', label: '落地', type: 'LAND', timeActual: '20:40', timeScheduled: '20:40', status: 'overtime-completed' },
      { id: 'e4', label: '靠桥', type: 'IN-BLK', timeActual: '21:00', timeScheduled: '20:50', status: 'overtime-completed' },
      { id: 'e5', label: '开始卸载', type: 'UNLOAD', timeActual: '21:05', timeScheduled: '21:00', status: 'overtime-completed' },
      { id: 'e6', label: '起飞', type: 'DEP', timeActual: '--:--', timeScheduled: '22:00', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '20:30', endTime: '21:30', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '21:30', endTime: '22:30', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 3. 延误航班
  {
    id: '3',
    flightNo: 'CZ6892',
    codeshare: 'CZ6893',
    arrInfo: {
      status: '入位',
      stand: '243L'
    },
    depInfo: {
      status: '延误',
      gate: '08' // Assuming gate is known
    },
    times: {
      std: '21:10',
      etd: '22:30',
      cobt: '21:35'
    },
    events: [
      { id: 'e7', label: '登机', type: 'BOARD', timeActual: '--:--', timeScheduled: '21:10', status: 'overtime-incomplete' },
      { id: 'e8', label: '关舱门', type: 'COBT', timeActual: '--:--', timeScheduled: '21:35', status: 'overtime-incomplete' },
      { id: 'e9', label: '推出', type: 'ATD', timeActual: '--:--', timeScheduled: '21:45', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '21:10', endTime: '22:10', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '21:35', endTime: '22:35', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 4. 正在出港
  {
    id: '4',
    flightNo: 'HU7856',
    codeshare: 'HU7857',
    arrInfo: {
      status: '到达',
      stand: '318'
    },
    depInfo: {
      status: '关闭',
      gate: '15'
    },
    times: {
      std: '21:00',
      atd: '21:18',
      cobt: '21:00'
    },
    events: [
      { id: 'e10', label: '开始登机', type: 'BOARD', timeActual: '20:30', timeScheduled: '20:30', status: 'overtime-completed' },
      { id: 'e11', label: '登机完成', type: 'BOARD', timeActual: '20:55', timeScheduled: '20:50', status: 'overtime-completed' },
      { id: 'e12', label: '关舱门', type: 'COBT', timeActual: '21:00', timeScheduled: '21:00', status: 'overtime-completed' },
      { id: 'e13', label: '推出', type: 'ATD', timeActual: '21:08', timeScheduled: '21:05', status: 'overtime-completed' },
      { id: 'e14', label: '起飞', type: 'DEP', timeActual: '21:18', timeScheduled: '21:15', status: 'overtime-completed' },
    ],
    annotations: [
      { type: 'connector', startTime: '20:30', endTime: '21:30', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '21:08', endTime: '22:08', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 5. 即将出港
  {
    id: '5',
    flightNo: 'SC4908',
    codeshare: 'SC4909',
    arrInfo: {
      status: '前起',
      stand: '266R'
    },
    depInfo: {
      status: '正常',
      gate: '22'
    },
    times: {
      std: '21:50',
      cobt: '21:20'
    },
    events: [
      { id: 'e15', label: '登机', type: 'BOARD', timeActual: '--:--', timeScheduled: '21:50', status: 'overtime-incomplete' },
    ],
    annotations: [
      { type: 'connector', startTime: '21:50', endTime: '22:50', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '22:20', endTime: '23:20', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 6. 进港准备中
  {
    id: '6',
    flightNo: 'ZH9152',
    codeshare: 'ZH9153',
    arrInfo: {
      status: '前起',
      stand: '305'
    },
    depInfo: {
      status: '正常',
      gate: '06'
    },
    times: {
      sta: '22:15',
      cobt: '--:--'
    },
    events: [
      { id: 'e16', label: '预计落地', type: 'LAND', timeActual: '--:--', timeScheduled: '22:15', status: 'alert' },
      { id: 'e17', label: '预计靠桥', type: 'IN-BLK', timeActual: '--:--', timeScheduled: '22:28', status: 'alert' },
    ],
    annotations: [
      { type: 'connector', startTime: '21:45', endTime: '22:45', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '22:15', endTime: '23:15', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 7. 调机航班
  {
    id: '7',
    flightNo: '3U8662',
    codeshare: '3U8663',
    arrInfo: {
      status: '入位',
      stand: '318A'
    },
    depInfo: {
      status: '正常',
      gate: '12'
    },
    times: {
      std: '22:00',
      cobt: '--:--'
    },
    events: [
      { id: 'e18', label: '机组就位', type: 'BOARD', timeActual: '--:--', timeScheduled: '22:00', status: 'warning' },
      { id: 'e19', label: '放行', type: 'COBT', timeActual: '--:--', timeScheduled: '22:30', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '22:00', endTime: '23:00', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '22:30', endTime: '23:30', label: '起飞', style: 'solid', color: 'gray' }
    ]
  }
];
