import { Flight } from './types';

// Generate 20 mock flights
export const MOCK_FLIGHTS: Flight[] = [
  // 1. 进港已完成 - 2个事件
  {
    id: '1',
    flightNo: 'CA1538 / CA1539',
    codeshare: 'CA1539',
    remarks: '前序航班延误，预计晚点30分钟。VIP旅客3人。',
    stand: '203',
    registration: 'B-6789',
    aircraftType: 'A320',
    aircraftCategory: 'M',
    route: 'PEK - CTU - SHA',
    arrInfo: {
      status: '到达',
      stand: '243'
    },
    depInfo: {
      status: '正常',
      gate: '15'
    },
    times: {
      ptd: '07:30',
      sta: '09:15',
      eta: '09:00',
      ata: '09:02',
      std: '10:45',
      etd: '10:50',
      cobt: '10:20',
      ctot: '10:35',
      atot: '10:48'
    },
    events: [
      {
        id: 'e1',
        label: '落地',
        type: 'LAND',
        timeActual: '09:00',
        timeScheduled: '09:00',
        status: 'overtime-completed',
        taskStatus: '结束',
        department: '机务保障',
        personnel: ['张三', '李四'],
        lifecycle: [
          { id: 'lc1', type: '结束', timestamp: '02-09 09:00', description: '任务完成' },
          { id: 'lc2', type: '开始', timestamp: '02-09 08:55', description: '开始执行任务' },
          { id: 'lc3', type: '到位', timestamp: '02-09 08:50', description: '人员到达机位' },
          { id: 'lc4', type: '领受', timestamp: '02-09 08:30', description: '张三领受任务' },
          { id: 'lc5', type: '发布', timestamp: '02-09 08:20', description: '任务已发布' },
          { id: 'lc_test_1', type: '预警', timestamp: '02-09 08:15', description: '系统自动预警：前序航班延误可能影响' },
          { id: 'lc_test_2', type: '催办', timestamp: '02-09 08:10', description: '调度中心催办：请尽快确认人员到位情况' },
          { id: 'lc_test_3', type: '预警', timestamp: '02-09 08:05', description: '资源预警：登机口变更需重新分配' },
          { id: 'lc_test_4', type: '发布', timestamp: '02-09 08:00', description: '任务尝试初次发布' },
          { id: 'lc_test_5', type: '创建', timestamp: '02-09 07:55', description: '系统生成初始任务单' },
          { id: 'lc_test_6', type: '预警', timestamp: '02-09 07:50', description: '离港系统同步异常' },
          { id: 'lc_test_7', type: '创建', timestamp: '02-08 17:22', description: '任务创建' },
        ]
      },
      {
        id: 'e2',
        label: '靠桥',
        type: 'IN-BLK',
        timeActual: '09:25',
        timeScheduled: '09:15',
        status: 'overtime-completed',
        taskStatus: '开始',
        department: '监装监卸',
        personnel: ['王五'],
        lifecycle: [
          { id: 'lc7', type: '催办', timestamp: '02-09 09:34', description: '离计划保障时间还剩1分钟' },
          { id: 'lc8', type: '预警', timestamp: '02-09 09:32', description: '监装监卸-装机结束-超时14分钟' },
          { id: 'lc9', type: '预警', timestamp: '02-09 08:46', description: '监装监卸-装机结束-开始装机已延误,可能影响装机结束保障工作' },
          { id: 'lc10', type: '创建', timestamp: '02-08 17:22', description: '任务创建' },
        ]
      },
    ],
    annotations: [
      { type: 'connector', startTime: '09:00', endTime: '10:00', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '10:00', endTime: '11:00', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 2. 过站 - 4个事件
  {
    id: '2',
    flightNo: 'MU5206',
    remarks: '过站时间紧张，请关注保障进度。',
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
    route: 'SHA - CTU - CAN',
    times: {
      sta: '09:40',
      std: '11:00',
      cobt: '09:30',
      ctot: '09:45',
      atot: '09:55'
    },
    events: [
      { id: 'e3', label: '落地', type: 'LAND', timeActual: '09:40', timeScheduled: '09:40', status: 'overtime-completed' },
      { id: 'e4', label: '靠桥', type: 'IN-BLK', timeActual: '10:00', timeScheduled: '09:50', status: 'overtime-completed' },
      { id: 'e5', label: '开始卸载', type: 'UNLOAD', timeActual: '10:05', timeScheduled: '10:00', status: 'overtime-completed' },
      { id: 'e6', label: '起飞', type: 'DEP', timeActual: '--:--', timeScheduled: '11:00', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '09:30', endTime: '10:30', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '10:30', endTime: '11:30', label: '起飞', style: 'solid', color: 'gray' }
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
    route: 'HGH - CTU - SZX',
    times: {
      std: '10:10',
      etd: '11:30',
      cobt: '10:35'
    },
    events: [
      { id: 'e7', label: '登机', type: 'BOARD', timeActual: '--:--', timeScheduled: '10:10', status: 'overtime-incomplete' },
      { id: 'e8', label: '关舱门', type: 'COBT', timeActual: '--:--', timeScheduled: '10:35', status: 'overtime-incomplete' },
      { id: 'e9', label: '推出', type: 'ATD', timeActual: '--:--', timeScheduled: '10:45', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '10:10', endTime: '11:10', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '10:35', endTime: '11:35', label: '起飞', style: 'solid', color: 'gray' }
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
    route: 'CKG - CTU - XIY',
    times: {
      std: '10:00',
      atd: '10:18',
      cobt: '10:00'
    },
    events: [
      { id: 'e10', label: '开始登机', type: 'BOARD', timeActual: '09:30', timeScheduled: '09:30', status: 'overtime-completed' },
      { id: 'e11', label: '登机完成', type: 'BOARD', timeActual: '09:55', timeScheduled: '09:50', status: 'overtime-completed' },
      { id: 'e12', label: '关舱门', type: 'COBT', timeActual: '10:00', timeScheduled: '10:00', status: 'overtime-completed' },
      { id: 'e13', label: '推出', type: 'ATD', timeActual: '10:08', timeScheduled: '10:05', status: 'overtime-completed' },
      { id: 'e14', label: '起飞', type: 'DEP', timeActual: '10:18', timeScheduled: '10:15', status: 'overtime-completed' },
    ],
    annotations: [
      { type: 'connector', startTime: '09:30', endTime: '10:30', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '10:08', endTime: '11:08', label: '起飞', style: 'solid', color: 'gray' }
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
    route: 'WUH - CTU - KMG',
    times: {
      std: '10:50',
      cobt: '10:20'
    },
    events: [
      { id: 'e15', label: '登机', type: 'BOARD', timeActual: '--:--', timeScheduled: '10:50', status: 'overtime-incomplete' },
    ],
    annotations: [
      { type: 'connector', startTime: '10:50', endTime: '11:50', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '11:20', endTime: '12:20', label: '起飞', style: 'solid', color: 'gray' }
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
    route: 'NKG - CTU - TAO',
    times: {
      sta: '11:15',
      cobt: '--:--'
    },
    events: [
      { id: 'e16', label: '预计落地', type: 'LAND', timeActual: '--:--', timeScheduled: '11:15', status: 'alert' },
      { id: 'e17', label: '预计靠桥', type: 'IN-BLK', timeActual: '--:--', timeScheduled: '11:28', status: 'alert' },
    ],
    annotations: [
      { type: 'connector', startTime: '10:45', endTime: '11:45', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '11:15', endTime: '12:15', label: '起飞', style: 'solid', color: 'gray' }
    ]
  },

  // 7. 调机航班
  {
    id: '7',
    flightNo: '3U8888',
    remarks: '重要货物，优先保障。',
    stand: '205',
    codeshare: '3U8663',
    arrInfo: {
      status: '入位',
      stand: '318A'
    },
    depInfo: {
      status: '正常',
      gate: '12'
    },
    route: 'TNA - CTU - CSX',
    times: {
      std: '11:00',
      cobt: '--:--'
    },
    events: [
      { id: 'e18', label: '机组就位', type: 'BOARD', timeActual: '--:--', timeScheduled: '11:00', status: 'warning' },
      { id: 'e19', label: '放行', type: 'COBT', timeActual: '--:--', timeScheduled: '11:30', status: 'warning' },
    ],
    annotations: [
      { type: 'connector', startTime: '11:00', endTime: '12:00', label: '放行', style: 'solid', color: 'gray' },
      { type: 'connector', startTime: '11:30', endTime: '12:30', label: '起飞', style: 'solid', color: 'gray' }
    ]
  }
];
