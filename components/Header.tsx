import React from 'react';

const StatusBadge = ({ color, label }: { color: string; label: string }) => {
  let bgClass = '';
  let dotClass = '';
  let textClass = '';
  let borderClass = '';

  switch (color) {
    case 'red':
      bgClass = 'bg-red-50';
      dotClass = 'bg-red-600';
      textClass = 'text-red-900';
      borderClass = 'border-red-100';
      break;
    case 'yellow':
      bgClass = 'bg-yellow-50';
      dotClass = 'bg-yellow-600';
      textClass = 'text-yellow-900';
      borderClass = 'border-yellow-100';
      break;
    case 'orange':
      bgClass = 'bg-orange-50';
      dotClass = 'bg-orange-600';
      textClass = 'text-orange-900';
      borderClass = 'border-orange-100';
      break;
    case 'blue':
      bgClass = 'bg-blue-50';
      dotClass = 'bg-[#137fec]';
      textClass = 'text-[#137fec]';
      borderClass = 'border-blue-100';
      break;
    case 'purple':
      bgClass = 'bg-purple-50';
      dotClass = 'bg-purple-600';
      textClass = 'text-purple-900';
      borderClass = 'border-purple-100';
      break;
    case 'cyan':
      bgClass = 'bg-cyan-50';
      dotClass = 'bg-cyan-600';
      textClass = 'text-cyan-900';
      borderClass = 'border-cyan-100';
      break;
  }

  return (
    <div className={`flex h-8 w-[100px] shrink-0 items-center justify-center gap-x-2 rounded-full border px-0 ${bgClass} ${borderClass}`}>
      <p className={`text-xs font-bold uppercase tracking-wide ${textClass}`}>{label}</p>
    </div>
  );
};

const FlightSearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索航班号..."
        className="w-48 h-9 px-3 pl-9 rounded-lg border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   text-sm font-mono tabular-nums"
        style={{ background: 'var(--bg-secondary)' }}
      />
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 
                       -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
        search
      </span>
    </div>
  );
};

const DatePicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-40 h-9 px-3 pl-9 rounded-lg border border-gray-300 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 
                   text-sm font-mono tabular-nums"
        style={{ background: 'var(--bg-secondary)' }}
      />
      <span className="material-symbols-outlined absolute left-2.5 top-1/2 
                       -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
        calendar_today
      </span>
    </div>
  );
};

const TimeScaleSelector: React.FC<{
  value: 5 | 10 | 30 | 60;
  onChange: (value: 5 | 10 | 30 | 60) => void;
}> = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as 5 | 10 | 30 | 60)}
        className="h-9 pl-3 pr-8 rounded-lg border border-gray-300 text-sm font-mono 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <option value={5}>5分钟</option>
        <option value={10}>10分钟</option>
        <option value={30}>30分钟</option>
        <option value={60}>1小时</option>
      </select>
      <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[18px] pointer-events-none">
        arrow_drop_down
      </span>
    </div>
  );
};

export const Header: React.FC<{
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
  timeScale: 5 | 10 | 30 | 60;
  onTimeScaleChange: (scale: 5 | 10 | 30 | 60) => void;
}> = ({ searchQuery, onSearchChange, selectedDate, onDateChange, timeScale, onTimeScaleChange }) => {
  return (
    <header className="flex-none flex items-center justify-end whitespace-nowrap border-b px-6 py-2.5 z-50 relative overflow-hidden" style={{ background: 'var(--bg-header)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
      {/* Inject custom animations for liquid blobs */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 左侧：Logo (True Liquid Morandi Style) */}
      <div className="absolute inset-y-0 left-0 w-[calc(100%-600px)] pointer-events-none overflow-hidden"
        style={{ maskImage: 'linear-gradient(to right, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 60%, transparent 100%)' }}>

        {/* Base Sky Blue Background */}
        <div className="absolute inset-0 bg-[#E5F7FD]"></div>

        {/* Liquid Blobs Container - High Blur for Fusion */}
        <div className="absolute inset-0 filter blur-3xl opacity-80">
          {/* Blob 1: Deep Sky Blue (#0088C7) - Darkest on left */}
          <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#0088C7] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>

          {/* Blob 2: Vibrant Sky Blue (#00A8E1) - Medium in center */}
          <div className="absolute top-[-10%] left-[20%] w-72 h-72 bg-[#00A8E1] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>

          {/* Blob 3: Light Sky Blue (#33B8E8) - Lightest on right */}
          <div className="absolute bottom-[-20%] left-[10%] w-72 h-72 bg-[#33B8E8] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Logo Container (Positioned on top of the liquid) */}
        <div className="absolute inset-y-0 left-0 w-full flex items-center pl-8">
          {/* Added drop-shadow for better contrast against light liquid */}
          <img src="/logo.png" alt="Logo" className="h-8 w-auto object-contain brightness-0 invert opacity-95 relative z-10 drop-shadow-sm" />
        </div>
      </div>

      {/* 右侧：图例 + 搜索 + 日期 */}
      <div className="flex items-center gap-4 relative z-10">
        {/* 图例容器 */}
        <div className="flex gap-3 mr-4 pr-6" style={{ borderRight: '1px solid var(--border-color)' }}>
          <StatusBadge color="yellow" label="超时完成" />
          <StatusBadge color="red" label="超时未完成" />
          <StatusBadge color="purple" label="关联告警" />
          <StatusBadge color="cyan" label="临期预警" />
        </div>

        {/* 搜索框 + 日期选择器（合并容器） */}
        <div className="flex items-center gap-0 h-9 rounded-lg border border-gray-300 overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
          {/* 搜索框 */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="输入航班号"
              className="w-40 h-9 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-mono tabular-nums"
            />
          </div>

          {/* 分隔符 */}
          <div className="h-5 w-px bg-gray-300"></div>

          {/* 日期选择器 */}
          <div className="relative flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-40 h-9 px-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-mono tabular-nums"
            />
          </div>
        </div>

        {/* 时间轴比例尺选择器 */}
        <TimeScaleSelector value={timeScale} onChange={onTimeScaleChange} />
      </div>
    </header>
  );
};