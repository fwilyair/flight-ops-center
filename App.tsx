import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Header } from './components/Header';
import { GanttRow } from './components/GanttRow';
import { FlightDetailPanel } from './components/FlightDetailPanel';
import { CapsuleDetailModal } from './components/CapsuleDetailModal';
import { MOCK_FLIGHTS } from './data';
import { timeToPixels } from './utils';
import { START_TIME_HOUR, Flight, TimelineEvent } from './types';

// Time markers generation - dynamically calculated based on flight data

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  // 航班列表状态（初始化为 Mock 数据）
  const [flights, setFlights] = useState<Flight[]>(MOCK_FLIGHTS);

  // 搜索和日期状态
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // 时间轴比例尺状态 (分钟数)
  const [timeScale, setTimeScale] = useState<5 | 10 | 30 | 60>(10);

  // 航班详情面板状态
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleFlightClick = (flight: Flight) => {
    if (selectedFlight?.id === flight.id && isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      setSelectedFlight(flight);
      setIsPanelOpen(true);
    }
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
  };

  const handleFlightUpdate = (updatedFlight: Flight) => {
    setFlights(prev => prev.map(f => f.id === updatedFlight.id ? updatedFlight : f));

    // 如果当前选中的航班就是更新的航班，也需要更新 selectedFlight 状态
    if (selectedFlight?.id === updatedFlight.id) {
      setSelectedFlight(updatedFlight);
    }
  };

  // 胶囊详情弹窗状态
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [capsuleFlightNo, setCapsuleFlightNo] = useState('');
  const [capsuleCodeshare, setCapsuleCodeshare] = useState<string | undefined>(undefined);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);

  const handleEventClick = (event: TimelineEvent, flight: Flight) => {
    setSelectedEvent(event);
    setCapsuleFlightNo(flight.flightNo.split(' / ')[0]);
    setCapsuleCodeshare(flight.codeshare);
    setIsCapsuleModalOpen(true);
  };

  const handleCapsuleModalClose = () => {
    setIsCapsuleModalOpen(false);
  };

  // 视频监控弹窗状态
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleVideoClick = () => {
    setIsVideoModalOpen(true);
  };

  const handleVideoModalClose = () => {
    setIsVideoModalOpen(false);
  };

  // 过滤航班列表
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // 航班号过滤（不区分大小写）
      const matchesSearch = searchQuery === '' ||
        flight.flightNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (flight.codeshare?.toLowerCase().includes(searchQuery.toLowerCase()));

      // 日期过滤（暂时返回 true，后续可扩展）
      const matchesDate = true;

      return matchesSearch && matchesDate;
    });
  }, [searchQuery, selectedDate]);

  // 计算所有航班事件的最大时间，确保时间轴足够长
  const calculateMaxTime = () => {
    let maxMinutes = 0;

    // 1. 遍历所有航班事件（使用过滤后的列表）
    filteredFlights.forEach(flight => {
      flight.events.forEach(event => {
        const time = event.timeScheduled || event.timeActual || '';
        if (time && time !== '--:--') {
          let [h, m] = time.split(':').map(Number);
          // 处理跨天：如果时间小于起始时间，视为第二天 (+24小时)
          if (h < START_TIME_HOUR) {
            h += 24;
          }
          const totalMinutes = (h - START_TIME_HOUR) * 60 + m;
          maxMinutes = Math.max(maxMinutes, totalMinutes);
        }
      });
    });

    // 2. 考虑当前时间（防止当前时间超出时间轴）
    const now = new Date();
    let currentH = now.getHours();
    const currentM = now.getMinutes();
    if (currentH < START_TIME_HOUR) {
      currentH += 24;
    }
    const currentTotalMinutes = (currentH - START_TIME_HOUR) * 60 + currentM;
    maxMinutes = Math.max(maxMinutes, currentTotalMinutes);

    // 额外增加 180 分钟（3小时）的缓冲空间，确保右侧有足够留白
    return maxMinutes + 180;
  };

  // 动态计算需要的时间刻度数量（基于选择的比例尺）
  const maxMinutes = calculateMaxTime();
  const INTERVALS = Math.max(60, Math.ceil(maxMinutes / timeScale)); // 每个刻度根据比例尺变化

  const currentTimePx = timeToPixels(currentTime, timeScale);
  const scrollContainerRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 自动滚动让当前时间对齐到屏幕左侧约 2/5 的位置
    const timer = setTimeout(() => {
      if (scrollContainerRef.current) {
        // 获取视口宽度（减去左侧侧边栏宽度 220px）
        const viewportWidth = window.innerWidth - 220;
        // 计算目标偏移植：可视宽度的 40%
        const targetOffset = viewportWidth * 0.4;

        const targetScroll = currentTimePx - targetOffset;
        console.log('Current time:', currentTime, 'Pixels:', currentTimePx, 'Target scroll:', targetScroll);
        scrollContainerRef.current.scrollLeft = Math.max(0, targetScroll);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [currentTimePx]);

  return (
    <div className="atmosphere-bg flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        timeScale={timeScale}
        onTimeScaleChange={setTimeScale}
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Main Scrollable Area */}
        <div ref={scrollContainerRef} className="flex-1 overflow-x-auto overflow-y-auto relative no-scrollbar">

          <div className="min-w-max h-full flex flex-col relative">

            {/* Sticky Timeline Header */}
            <div className="sticky top-0 z-40 flex h-14 border-b bg-white dark:bg-gray-900" style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              {/* Corner Box (Intersection of sticky headers) */}
              <div className="sticky left-0 z-50 w-[260px] min-w-[260px] border-r flex items-center px-3 justify-between bg-white dark:bg-gray-900" style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                {/* 航班列表 Header Content Removed */}
              </div>

              {/* Timeline Ticks */}
              <div className="flex flex-1 relative">
                <div className="flex w-full h-full">
                  {Array.from({ length: INTERVALS }).map((_, i) => {
                    const totalMins = i * timeScale;
                    // Fix: Ensure hours wrap around 24
                    const h = Math.floor(START_TIME_HOUR + totalMins / 60) % 24;
                    const m = totalMins % 60;
                    const timeStr = `${h}:${m.toString().padStart(2, '0')}`;
                    // 刻度宽度固定为80px，每个刻度代表的时间长度由timeScale决定
                    return (
                      <div key={i} className="timeline-tick w-[80px] flex-none flex items-center justify-center text-sm font-bold text-gray-900 dark:text-gray-100 tabular-nums font-mono select-none border-l border-gray-100 dark:border-gray-800">
                        {timeStr}
                      </div>
                    );
                  })}
                </div>

                {/* Current Time Indicator in Timeline Header */}
                <div
                  className="absolute z-50 flex flex-col items-center pointer-events-none"
                  style={{
                    left: `${currentTimePx}px`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="bg-red-600 text-white text-sm font-bold px-1.5 h-[22px] flex items-center justify-center rounded shadow-sm tabular-nums font-mono border border-red-500 whitespace-nowrap leading-none pb-[1px]">
                    {currentTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Rows Area */}
            <div className="flex-1 flex relative">

              {/* Past Time Shade (Left of Current Time) - Tech Dot Pattern */}
              <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none"
                style={{
                  left: '260px',
                  width: `${currentTimePx}px`,
                  // Tech Dot Matrix Pattern
                  backgroundImage: `
                    radial-gradient(circle, rgba(100, 116, 139, 0.2) 1px, transparent 1px)
                  `,
                  backgroundSize: '12px 12px',
                  // Visual Effects: Desaturate + Blur slightly
                  backdropFilter: 'grayscale(0.6) blur(0.5px) contrast(0.95)',
                  backgroundColor: 'rgba(241, 245, 249, 0.3)' // Light tint (slate-100)
                }}
              ></div>
              <div
                className="absolute top-0 bottom-0 z-10 pointer-events-none dark:hidden"
                style={{
                  left: '260px',
                  width: `${currentTimePx}px`,
                  background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 100%)'
                }}
              ></div>

              {/* Current Time Line (Vertical Red Line) - Follows scroll */}
              <div
                className="current-time-line absolute top-0 bottom-0 w-[2px] bg-red-500 z-30 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                style={{ left: `${260 + currentTimePx}px` }}
              ></div>

              <div className="flex flex-col w-full min-w-max">
                {filteredFlights.map((flight) => (
                  <GanttRow
                    key={flight.id}
                    flight={flight}
                    timeScale={timeScale}
                    onClick={() => handleFlightClick(flight)}
                    onEventClick={(event) => handleEventClick(event, flight)}
                    onVideoClick={handleVideoClick}
                  />
                ))}

                {/* Fill remaining space with empty rows for aesthetics */}

              </div>

            </div>

          </div>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 z-50 lg:hidden">
        <button className="text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center" style={{ background: 'var(--accent-primary)' }}>
          <span className="material-symbols-outlined">info</span>
        </button>
      </div>
      {/* Flight Detail Panel */}
      <FlightDetailPanel
        flight={selectedFlight}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onFlightUpdate={handleFlightUpdate}
      />

      {/* Capsule Detail Modal */}
      <CapsuleDetailModal
        isOpen={isCapsuleModalOpen}
        onClose={handleCapsuleModalClose}
        event={selectedEvent}
        flightNo={capsuleFlightNo}
        codeshare={capsuleCodeshare}
        onControl={() => console.log('Control clicked for event:', selectedEvent?.label)}
      />

      {/* Video Monitor Modal - Under Construction */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={handleVideoModalClose}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[400px] overflow-hidden animate-in zoom-in-95 duration-200 scale-100 opacity-100">
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
              <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">监控视频</span>
              <button
                onClick={handleVideoModalClose}
                className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-10 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl text-orange-500">engineering</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                正在建设中
              </h3>

              <button
                onClick={handleVideoModalClose}
                className="mt-4 px-10 py-2.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:via-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;