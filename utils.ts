import { START_TIME_HOUR, START_TIME_MIN, PIXELS_PER_MINUTE } from './types';

export const timeToPixels = (timeStr: string): number => {
  if (!timeStr || timeStr === '--:--') return 0;

  const [hours, minutes] = timeStr.split(':').map(Number);

  // 处理跨天情况：如果小时数小于起始时间，视为第二天
  let adjustedHours = hours;
  if (adjustedHours < START_TIME_HOUR) {
    adjustedHours += 24;
  }

  const totalMinutes = (adjustedHours - START_TIME_HOUR) * 60 + (minutes - START_TIME_MIN);
  return totalMinutes * PIXELS_PER_MINUTE;
};

export const getDurationPixels = (start: string, end: string): number => {
  return timeToPixels(end) - timeToPixels(start);
};

export const getColorForEventType = (type: string, status?: string) => {
  // First check status-based overrides
  switch (status) {
    case 'overtime-completed':
      return {
        bg: 'bg-yellow-500', // Keep 500 for yellow as 600 might be too dark for background
        lightBg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-white',
        labelBg: 'bg-yellow-500'
      };
    case 'overtime-incomplete':
      return {
        bg: 'bg-red-600',
        lightBg: 'bg-red-50',
        border: 'border-red-600',
        text: 'text-white',
        labelBg: 'bg-red-600'
      };
    case 'alert':
      return {
        bg: 'bg-purple-600',
        lightBg: 'bg-purple-50',
        border: 'border-purple-600',
        text: 'text-white',
        labelBg: 'bg-purple-600'
      };
    case 'warning':
      return {
        bg: 'bg-cyan-600', // Using blue-500 for cyan-like if cyan-600 is not available, but cyan-600 is valid tailwind
        lightBg: 'bg-cyan-50',
        border: 'border-cyan-600',
        text: 'text-white',
        labelBg: 'bg-cyan-600'
      };
  }

  // Fallback to type-based colors
  switch (type) {
    // 所有类型默认使用统一的素色，以便状态颜色突出
    case 'LAND':
    case 'IN-BLK':
    case 'UNLOAD':
    case 'COBT':
    case 'ATD':
    case 'BOARD':
    case 'ARR':
    case 'DEP':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        lightBg: 'bg-slate-50 dark:bg-slate-900',
        border: 'border-slate-200 dark:border-slate-700',
        text: 'text-slate-600 dark:text-slate-400',
        labelBg: 'bg-slate-100 dark:bg-slate-800'
      };
  }
};