import React, { useRef, useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { GanttRow, EventHoverInfo } from './components/GanttRow';
import { FlightDetailPanel } from './components/FlightDetailPanel';
import { CapsuleDetailModal } from './components/CapsuleDetailModal';
import { HelpManualModal } from './components/HelpManualModal';
import { MotionModalShell } from './components/MotionModalShell';
import { MOCK_FLIGHTS } from './data';
import { timeToPixels } from './utils';
import { START_TIME_HOUR, Flight, TimelineEvent } from './types';
import { Flip, gsap } from './motion/gsap';
import { MOTION_DURATION, MOTION_EASE, MOTION_STAGGER } from './motion/tokens';
import { prefersReducedMotion, REDUCED_MOTION_QUERY } from './motion/preferences';

// Time markers generation - dynamically calculated based on flight data

const HOVER_GUIDE_TIMELINE_OFFSET_PX = 269;

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  // 使用手册弹窗状态
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // 航班列表状态（初始化为 Mock 数据）
  const [flights, setFlights] = useState<Flight[]>(MOCK_FLIGHTS);

  // 搜索和日期状态
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // 时间轴比例尺状态 (分钟数)
  const [timeScale, setTimeScale] = useState<5 | 10 | 30 | 60>(10);
  // 视图切换暂作交互示例，待业务筛选规则明确后再接入实际数据变换。
  const [isControlView, setIsControlView] = useState(false);
  // 全局展开状态作为所有可见航班行共享的密度指令。
  const [expandAllRows, setExpandAllRows] = useState(false);

  // 悬浮在事件胶囊上时的虚线与时间标签信息
  const [hoveredEventInfo, setHoveredEventInfo] = useState<EventHoverInfo | null>(null);
  const [renderedHoverInfo, setRenderedHoverInfo] = useState<EventHoverInfo | null>(null);
  const hoverMotionScopeRef = useRef<HTMLDivElement>(null);
  const hoverMotionGenerationRef = useRef(0);

  const handleEventHover = useCallback((info: EventHoverInfo | null) => {
    if (info) setRenderedHoverInfo(info);
    setHoveredEventInfo(info);
  }, []);

  useLayoutEffect(() => {
    const scope = hoverMotionScopeRef.current;
    if (!scope || !renderedHoverInfo) return;

    const badges = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-motion-hover-badge]')
    );
    const guides = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-motion-hover-guide]')
    );
    const targets = [...guides, ...badges];
    if (targets.length === 0) return;

    const generation = ++hoverMotionGenerationRef.current;
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    let contextReverted = false;
    const context = gsap.context(() => {
      gsap.killTweensOf(targets);

      if (reducedMotionMedia.matches) {
        if (!hoveredEventInfo) setRenderedHoverInfo(null);
        return;
      }

      const timeline = gsap.timeline({
        onComplete: () => {
          if (
            !hoveredEventInfo &&
            hoverMotionGenerationRef.current === generation
          ) {
            setRenderedHoverInfo(null);
          }
        },
      });

      if (hoveredEventInfo) {
        if (guides.length > 0) {
          timeline.fromTo(
            guides,
            { autoAlpha: 0 },
            {
              autoAlpha: 1,
              duration: MOTION_DURATION.fast,
              overwrite: true,
            },
            0
          );
        }

        if (badges.length > 0) {
          timeline.fromTo(
            badges,
            { autoAlpha: 0, y: 4, scale: 0.96 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: MOTION_DURATION.fast,
              ease: MOTION_EASE.standard,
              overwrite: true,
            },
            0
          );
        }
      } else {
        timeline.to(targets, {
          autoAlpha: 0,
          duration: 0.1,
          ease: MOTION_EASE.exit,
          overwrite: true,
        });
      }
    }, scope);

    const revertContext = () => {
      if (contextReverted) return;
      contextReverted = true;
      context.revert();
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (!event.matches) return;

      if (hoverMotionGenerationRef.current === generation) {
        hoverMotionGenerationRef.current += 1;
      }
      revertContext();
      gsap.killTweensOf(targets);
      if (!hoveredEventInfo) setRenderedHoverInfo(null);
    };

    reducedMotionMedia.addEventListener('change', handleReducedMotionChange);

    return () => {
      reducedMotionMedia.removeEventListener('change', handleReducedMotionChange);
      if (hoverMotionGenerationRef.current === generation) {
        hoverMotionGenerationRef.current += 1;
      }
      revertContext();
    };
  }, [hoveredEventInfo, renderedHoverInfo]);

  // 航班详情面板状态
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const selectedFlightIdRef = useRef<string | null>(null);

  const handleFlightClick = useCallback((flight: Flight) => {
    const isSameFlight = selectedFlightIdRef.current === flight.id;
    selectedFlightIdRef.current = flight.id;
    setSelectedFlight(flight);
    setIsPanelOpen(prev => isSameFlight ? !prev : true);
  }, []);

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  const handleFlightUpdate = useCallback((updatedFlight: Flight) => {
    setFlights(prev => prev.map(f => f.id === updatedFlight.id ? updatedFlight : f));
    setSelectedFlight(prev => prev?.id === updatedFlight.id ? updatedFlight : prev);
  }, []);

  // 胶囊详情弹窗状态
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [capsuleFlightNo, setCapsuleFlightNo] = useState('');
  const [capsuleCodeshare, setCapsuleCodeshare] = useState<string | undefined>(undefined);
  const [isCapsuleModalOpen, setIsCapsuleModalOpen] = useState(false);

  const handleEventClick = useCallback((event: TimelineEvent, flight: Flight) => {
    setSelectedEvent(event);
    setCapsuleFlightNo(flight.flightNo.split(' / ')[0]);
    setCapsuleCodeshare(flight.codeshare);
    setIsCapsuleModalOpen(true);
  }, []);

  const handleCapsuleModalClose = useCallback(() => {
    setIsCapsuleModalOpen(false);
  }, []);

  // 视频监控弹窗状态
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleVideoClick = useCallback(() => {
    setIsVideoModalOpen(true);
  }, []);

  const handleVideoModalClose = useCallback(() => {
    setIsVideoModalOpen(false);
  }, []);

  // 过滤航班列表
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // 航班号过滤（不区分大小写）
      const matchesSearch = deferredSearchQuery === '' ||
        flight.flightNo.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
        (flight.codeshare?.toLowerCase().includes(deferredSearchQuery.toLowerCase()));

      // 日期过滤（暂时返回 true，后续可扩展）
      const matchesDate = true;

      return matchesSearch && matchesDate;
    });
  }, [flights, deferredSearchQuery, selectedDate]);

  const filteredFlightKey = useMemo(
    () => `${deferredSearchQuery}|${selectedDate}|${filteredFlights.map(flight => flight.id).join(',')}`,
    [deferredSearchQuery, selectedDate, filteredFlights]
  );

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
  const timelineLayoutRef = useRef<HTMLDivElement>(null);
  const pendingFlipStateRef = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const timelineFlipRef = useRef<ReturnType<typeof Flip.from> | null>(null);
  const previousFilteredFlightKeyRef = useRef(filteredFlightKey);

  useLayoutEffect(() => {
    const previousFilteredFlightKey = previousFilteredFlightKeyRef.current;
    previousFilteredFlightKeyRef.current = filteredFlightKey;
    if (previousFilteredFlightKey === filteredFlightKey) return;

    const scope = timelineLayoutRef.current;
    if (!scope) return;

    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    if (reducedMotionMedia.matches) return;

    const rows: HTMLElement[] = Array.from(
      scope.querySelectorAll<HTMLElement>('[data-motion-flight-row]')
    );
    if (rows.length === 0) return;

    // `amount` caps the first-to-last row start-time spread.
    const staggerSpread = Math.min(
      0.24,
      MOTION_STAGGER.list * Math.max(0, rows.length - 1)
    );

    const context = gsap.context(() => {
      gsap.killTweensOf(rows);
      const timeline = gsap.timeline();

      timeline.fromTo(
        rows,
        { autoAlpha: 0, y: 10 },
        {
          autoAlpha: 1,
          y: 0,
          duration: MOTION_DURATION.fast,
          ease: MOTION_EASE.standard,
          stagger: { amount: staggerSpread },
          overwrite: true,
        },
        0
      );

      if (deferredSearchQuery && rows[0]) {
        timeline.fromTo(
          rows[0],
          { scale: 1.012 },
          { scale: 1, duration: 0.5, ease: MOTION_EASE.standard },
          0
        );
      }

      timeline.set(rows, { clearProps: 'opacity,visibility,transform' });
    }, scope);

    let contextReverted = false;
    const revertContext = () => {
      if (contextReverted) return;
      contextReverted = true;
      context.revert();
    };
    const restoreRows = () => {
      revertContext();
      gsap.killTweensOf(rows);
      gsap.set(rows, { clearProps: 'opacity,visibility,transform' });
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) restoreRows();
    };

    reducedMotionMedia.addEventListener('change', handleReducedMotionChange);
    if (reducedMotionMedia.matches) restoreRows();

    return () => {
      reducedMotionMedia.removeEventListener('change', handleReducedMotionChange);
      revertContext();
    };
  }, [filteredFlightKey, deferredSearchQuery]);

  const revertTimelineFlip = useCallback(() => {
    const animation = timelineFlipRef.current;
    if (!animation) return;

    timelineFlipRef.current = null;
    animation.revert();
  }, []);

  useEffect(() => {
    const reducedMotionMedia = window.matchMedia(REDUCED_MOTION_QUERY);
    const restoreTimelineLayout = () => {
      pendingFlipStateRef.current = null;
      revertTimelineFlip();
    };
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) restoreTimelineLayout();
    };

    reducedMotionMedia.addEventListener('change', handleReducedMotionChange);
    if (reducedMotionMedia.matches) restoreTimelineLayout();

    return () => {
      reducedMotionMedia.removeEventListener('change', handleReducedMotionChange);
    };
  }, [revertTimelineFlip]);

  const handleTimeScaleChange = useCallback((nextScale: 5 | 10 | 30 | 60) => {
    if (nextScale === timeScale) return;

    revertTimelineFlip();

    const scope = timelineLayoutRef.current;
    if (scope && !prefersReducedMotion()) {
      const layoutTargets = scope.querySelectorAll<HTMLElement>('[data-motion-layout]');
      pendingFlipStateRef.current = layoutTargets.length > 0
        ? Flip.getState(layoutTargets, { simple: true })
        : null;
    } else {
      pendingFlipStateRef.current = null;
    }

    setTimeScale(nextScale);
  }, [revertTimelineFlip, timeScale]);

  useLayoutEffect(() => {
    const previous = pendingFlipStateRef.current;
    pendingFlipStateRef.current = null;
    if (!previous) return;

    revertTimelineFlip();
    const animation = Flip.from(previous, {
      duration: MOTION_DURATION.layout,
      ease: MOTION_EASE.layout,
      absolute: false,
      nested: true,
      prune: true,
      simple: true,
      overwrite: true,
    });
    timelineFlipRef.current = animation;

    return () => {
      if (timelineFlipRef.current === animation) {
        timelineFlipRef.current = null;
        animation.revert();
      }
    };
  }, [revertTimelineFlip, timeScale]);

  useLayoutEffect(() => {
    return () => {
      revertTimelineFlip();
      pendingFlipStateRef.current = null;
    };
  }, [revertTimelineFlip]);

  useEffect(() => {
    // Update current time every minute
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(`${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isUserScrolledRef = useRef<boolean>(false);
  const lastUserGestureTimeRef = useRef<number>(0);

  // 记录用户真实物理交互手势（滚轮、触摸滑动、点击拖拽）
  const handleUserGesture = useCallback(() => {
    lastUserGestureTimeRef.current = Date.now();
    isUserScrolledRef.current = true;
  }, []);

  // 滚动至当前时间处理函数（精确定位到右侧甘特图可视区域 30% 处）
  const scrollToCurrentTime = useCallback((smooth = true) => {
    if (scrollContainerRef.current) {
      isUserScrolledRef.current = false; // 用户按下空格或初始化时重置手动标志，恢复自动跟随

      const containerWidth = scrollContainerRef.current.clientWidth;
      const visibleGanttWidth = Math.max(0, containerWidth - 260); // 扣除左侧 260px 航班信息卡片固定列
      // 当前时间定位在可视区域左侧 30% 处（过去时间占 30%，未来保障时间占 70%）
      const targetScroll = Math.max(0, currentTimePx - (visibleGanttWidth * 0.3));

      if (smooth) {
        scrollContainerRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollLeft = targetScroll;
      }
    }
  }, [currentTimePx]);

  // 页面初始加载时定位到当前时间一次
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToCurrentTime(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 当当前时间推进且用户处于自动跟随状态（未手动横向滚动）时，无延迟同步调整 scrollLeft
  // 确保红色当前时间游标在屏幕上 100% 绝对固定在 30% 位置，甘特图卡片随时间向左后退
  useEffect(() => {
    if (!isUserScrolledRef.current) {
      scrollToCurrentTime(false);
    }
  }, [currentTimePx, scrollToCurrentTime]);

  // 窗口大小改变时，保持 30% 固定位置
  useEffect(() => {
    const handleResize = () => {
      if (!isUserScrolledRef.current) {
        scrollToCurrentTime(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [scrollToCurrentTime]);

  // 监听容器 scroll 事件，只有当 500ms 内存在真实物理手势时才标记为用户手动操作
  const handleScroll = useCallback(() => {
    if (Date.now() - lastUserGestureTimeRef.current < 500) {
      isUserScrolledRef.current = true;
    }
  }, []);

  // 监听空格键按压事件，快捷跳转回当前时间并重新开启跟随
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );

      if ((e.code === 'Space' || e.key === ' ') && !isInput) {
        e.preventDefault(); // 阻止浏览器页面平移等默认行为
        scrollToCurrentTime(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToCurrentTime]);

  return (
    <div ref={hoverMotionScopeRef} className="atmosphere-bg flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        timeScale={timeScale}
        onTimeScaleChange={handleTimeScaleChange}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Main Scrollable Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onWheel={handleUserGesture}
          onTouchMove={handleUserGesture}
          onMouseDown={handleUserGesture}
          className="flex-1 overflow-x-auto overflow-y-auto relative"
        >

          <div ref={timelineLayoutRef} className="min-w-max h-full flex flex-col relative">

            {/* Sticky Timeline Header */}
            <div className="sticky top-0 z-[60] flex h-8 shrink-0 border-b bg-white dark:bg-gray-900" style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
              {/* Corner Box (Intersection of sticky headers) */}
              <div className="sticky left-0 z-[70] flex w-[260px] min-w-[260px] items-center gap-1.5 border-r bg-white px-4 dark:bg-gray-900" style={{ borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                {/* 保留左侧半宽作为视图模式入口，并用独立色相区分穿透/管控状态。 */}
                <button
                  type="button"
                  aria-pressed={isControlView}
                  aria-label={`当前为${isControlView ? '管控视图' : '穿透视图'}，点击切换为${isControlView ? '穿透视图' : '管控视图'}`}
                  onClick={() => setIsControlView(previous => !previous)}
                  className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-white/90 px-2 text-[13px] font-semibold transition-[background-color,background-image,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isControlView
                    ? 'bg-teal-50 bg-[radial-gradient(circle_at_center,#ccfbf1_0%,#f0fdfa_68%,#ffffff_100%)] text-teal-800 shadow-[0_2px_8px_rgba(13,148,136,0.14)] hover:bg-[radial-gradient(circle_at_center,#99f6e4_0%,#ccfbf1_68%,#f0fdfa_100%)] focus-visible:ring-teal-500'
                    : 'bg-violet-50 bg-[radial-gradient(circle_at_center,#ede9fe_0%,#f5f3ff_68%,#ffffff_100%)] text-violet-700 shadow-[0_2px_8px_rgba(124,58,237,0.14)] hover:bg-[radial-gradient(circle_at_center,#ddd6fe_0%,#ede9fe_68%,#f5f3ff_100%)] focus-visible:ring-violet-500'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">swap_horiz</span>
                  <span className="truncate">{isControlView ? '管控视图' : '穿透视图'}</span>
                </button>

                {/* 同一按钮复用展开/收起操作，避免占用额外顶部空间。 */}
                <button
                  type="button"
                  aria-pressed={expandAllRows}
                  aria-label={expandAllRows ? '收起全部航班任务' : '展开全部航班任务'}
                  disabled={filteredFlights.length === 0}
                  onClick={() => setExpandAllRows(previous => !previous)}
                  className={`flex h-8 min-w-0 flex-1 items-center justify-center gap-1 rounded-full border border-white/90 px-2 text-[13px] font-semibold transition-[background-color,background-image,border-color,color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${expandAllRows
                    ? 'bg-white text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.12)] hover:bg-slate-50 focus-visible:ring-slate-400'
                    : 'bg-orange-50 bg-[radial-gradient(circle_at_center,#ffedd5_0%,#fff7ed_68%,#ffffff_100%)] text-orange-800 shadow-[0_2px_8px_rgba(234,88,12,0.14)] hover:bg-[radial-gradient(circle_at_center,#fed7aa_0%,#ffedd5_68%,#fff7ed_100%)] focus-visible:ring-orange-500'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px] leading-none" aria-hidden="true">
                    {expandAllRows ? 'unfold_less' : 'unfold_more'}
                  </span>
                  <span>{expandAllRows ? '全部收起' : '全部展开'}</span>
                </button>
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

                {/* Hover Time Indicator Badges in Timeline Header */}
                {renderedHoverInfo && (
                  <>
                    {/* Green Dot Scheduled Time Badge */}
                    <div
                      data-motion-hover-badge
                      className="absolute z-50 flex flex-col items-center pointer-events-none"
                      style={{
                        left: `${renderedHoverInfo.greenDotPx}px`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="bg-emerald-600 text-white text-sm font-bold px-1.5 h-[22px] flex items-center justify-center rounded shadow-sm tabular-nums font-mono border border-emerald-500 whitespace-nowrap leading-none pb-[1px]">
                        {renderedHoverInfo.timeScheduled}
                      </div>
                    </div>

                    {/* Purple Dot Calc Point Time Badge */}
                    {renderedHoverInfo.calcPointTime && renderedHoverInfo.purpleDotPx !== undefined && (
                      <div
                        data-motion-hover-badge
                        className="absolute z-50 flex flex-col items-center pointer-events-none"
                        style={{
                          left: `${renderedHoverInfo.purpleDotPx}px`,
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="bg-purple-600 text-white text-sm font-bold px-1.5 h-[22px] flex items-center justify-center rounded shadow-sm tabular-nums font-mono border border-purple-500 whitespace-nowrap leading-none pb-[1px]">
                          {renderedHoverInfo.calcPointTime}
                        </div>
                      </div>
                    )}
                  </>
                )}

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

              {/* Hover Guide Lines (Green & Purple dashed vertical lines extending to timeline header) */}
              {renderedHoverInfo && (
                <>
                  {/* Green Dot Vertical Line */}
                  <div
                    data-motion-hover-guide
                    className="absolute pointer-events-none z-30"
                    style={{
                      left: `${HOVER_GUIDE_TIMELINE_OFFSET_PX + renderedHoverInfo.greenDotPx}px`,
                      top: 0,
                      height: `${renderedHoverInfo.greenDotY}px`,
                      width: '2px',
                      borderLeft: '2px dashed #10B981',
                      transform: 'translateX(-50%)',
                    }}
                  />

                  {/* Purple Dot Vertical Line */}
                  {renderedHoverInfo.purpleDotPx !== undefined && renderedHoverInfo.purpleDotY !== undefined && (
                    <div
                      data-motion-hover-guide
                      className="absolute pointer-events-none z-30"
                      style={{
                        left: `${HOVER_GUIDE_TIMELINE_OFFSET_PX + renderedHoverInfo.purpleDotPx}px`,
                        top: 0,
                        height: `${renderedHoverInfo.purpleDotY}px`,
                        width: '2px',
                        borderLeft: '2px dashed #8B5CF6',
                        transform: 'translateX(-50%)',
                      }}
                    />
                  )}
                </>
              )}

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
                    currentTime={currentTime}
                    expandAllRows={expandAllRows}
                    onClick={() => handleFlightClick(flight)}
                    onEventClick={(event) => handleEventClick(event, flight)}
                    onVideoClick={handleVideoClick}
                    onEventHover={handleEventHover}
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
        <button
          onClick={() => setIsHelpModalOpen(true)}
          className="text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center"
          style={{ background: 'var(--accent-primary)' }}
        >
          <span className="material-symbols-outlined">help</span>
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
        currentTime={currentTime}
        onControl={() => console.log('Control clicked for event:', selectedEvent?.label)}
      />

      {/* Video Monitor Modal - Under Construction */}
      <MotionModalShell
        isOpen={isVideoModalOpen}
        onClose={handleVideoModalClose}
        ariaLabel="监控视频"
        panelClassName="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[400px] overflow-hidden"
      >
            {/* Header */}
            <div data-motion-modal-content className="relative px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-gray-800">
              <span className="text-xl font-bold tracking-wide text-gray-900 dark:text-white">监控视频</span>
              <button
                onClick={handleVideoModalClose}
                className="absolute right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all duration-200 hover:scale-110 hover:shadow-md"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div data-motion-modal-content className="p-10 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-5xl text-orange-500">engineering</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                正在建设中
              </h3>

              <button
                onClick={handleVideoModalClose}
                className="mt-4 px-10 py-2.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:via-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 hover:scale-105"
              >
                我知道了
              </button>
            </div>
      </MotionModalShell>
      {/* Help Manual Modal */}
      <HelpManualModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};

export default App;
