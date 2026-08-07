import React, { useState } from 'react';
import { MotionModalShell } from './MotionModalShell';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'events' | 'interactions';

export const HelpManualModal: React.FC<HelpManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <MotionModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="穿透管控使用手册"
      containerClassName="p-4 sm:p-6 overflow-hidden"
      panelClassName="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[760px] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-800"
    >
        
        {/* Modal Header */}
        <div data-motion-modal-content className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-800/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">help</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">穿透管控-使用手册</h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭使用手册"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all hover:scale-110"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation - Equal 3-Column Split */}
        <div data-motion-modal-content className="grid grid-cols-3 px-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">dashboard</span>
            系统总览
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`w-full py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'events'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">view_timeline</span>
            任务胶囊
          </button>
          <button
            onClick={() => setActiveTab('interactions')}
            className={`w-full py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'interactions'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">touch_app</span>
            常用操作
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div data-motion-modal-content className="flex-1 overflow-y-auto no-scrollbar p-6 text-gray-700 dark:text-gray-300">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Status Header Bar */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                  系统颜色图例
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div className="p-4 rounded-2xl border border-yellow-200 bg-yellow-50/70 dark:bg-yellow-900/20 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-yellow-500 shrink-0"></span>
                      <span className="font-bold text-sm text-yellow-900 dark:text-yellow-300">超时完成</span>
                    </div>
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">任务超时但已完成</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-red-200 bg-red-50/70 dark:bg-red-900/20 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0"></span>
                      <span className="font-bold text-sm text-red-900 dark:text-red-300">超时未完成</span>
                    </div>
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">任务超时且未完成</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/70 dark:bg-purple-900/20 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-purple-600 shrink-0"></span>
                      <span className="font-bold text-sm text-purple-900 dark:text-purple-300">关联告警</span>
                    </div>
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">前序关联任务超时</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 dark:bg-cyan-900/20 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-cyan-600 shrink-0"></span>
                      <span className="font-bold text-sm text-cyan-900 dark:text-cyan-300">临期预警</span>
                    </div>
                    <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">任务临近计划时间</p>
                  </div>

                  <div className="p-4 rounded-2xl border border-pink-200 bg-pink-50/90 dark:bg-pink-900/20 flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-pink-500 shrink-0"></span>
                      <span className="font-bold text-sm text-pink-900 dark:text-pink-300">延误航班</span>
                    </div>
                    <p className="text-xs font-semibold text-pink-700 dark:text-pink-400">淡粉色底色填充</p>
                  </div>
                </div>
              </section>

              {/* Timeline Header & Current Time Indicator */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                  时间轴与游标
                </h3>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 space-y-5 shadow-sm">
                  <div className="flex items-center gap-5">
                    <div className="bg-red-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg font-mono shadow-sm shrink-0">13:57</div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <b className="font-bold text-gray-900 dark:text-white">当前时间</b>，红色实线，<b className="font-bold text-gray-900 dark:text-white">空格键</b>快速跳转居中。
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="bg-emerald-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg font-mono shadow-sm shrink-0">11:00</div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <b className="font-bold text-gray-900 dark:text-white">计划时间</b>，胶囊绿色悬浮，顶部时间轴同步高亮。
                    </span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg font-mono shadow-sm shrink-0">11:10</div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                      <b className="font-bold text-gray-900 dark:text-white">修正计划时间</b>，胶囊紫色悬浮，顶部时间轴同步高亮。
                    </span>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: EVENTS & CAPSULES */}
          {activeTab === 'events' && (
            <div className="space-y-7 animate-in fade-in duration-150">
              {/* Capsule Border Rules */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                  任务胶囊框线规则
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl border-0 bg-gray-50/60 dark:bg-gray-800/50 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-gray-900 dark:text-white">1. 无框线</span>
                    </div>
                    <div className="h-11 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-between px-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-inner">
                      <span>靠桥</span>
                      <span>计 10:15 | 实 10:18</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">默认状态</p>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-900/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    {/* Outer card rotating animated SVG dashed border */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-visible">
                      <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="16" ry="16" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'dashMarch 2s linear infinite' }} />
                    </svg>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-amber-900 dark:text-amber-300">2. 橙黄虚线旋转框</span>
                    </div>
                    <div className="relative h-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-between px-4 text-sm font-bold text-amber-900 dark:text-amber-200 shadow-inner">
                      {/* Inner capsule rotating animated SVG dashed border */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-full overflow-visible">
                        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="22" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'dashMarch 2s linear infinite' }} />
                      </svg>
                      <span>推出开车</span>
                      <span>计 14:20 | 实 --:--</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">已发管控/未回执</p>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-emerald-900 dark:text-emerald-300">3. 渐变实线框</span>
                    </div>
                    <div className="h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-between px-4 text-sm font-bold text-emerald-900 dark:text-emerald-200 shadow-inner">
                      <span>开始卸载</span>
                      <span>计 10:30 | 实 10:29</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">已收回执确认</p>
                  </div>
                </div>
              </section>

              {/* Dots and Scale Lines */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                  时间刻度点规则
                </h3>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-gray-800/80 border border-slate-200 dark:border-gray-700 space-y-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm shrink-0"></span>
                    <div>
                      <span className="font-bold text-base text-gray-900 dark:text-white">绿色圆点：</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">计划时间</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="w-4 h-4 rounded-full bg-[#A78BFA] ring-2 ring-white shadow-sm shrink-0 animate-pulse"></span>
                    <div>
                      <span className="font-bold text-base text-purple-900 dark:text-purple-300">紫色圆点：</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">修正计划时间</span>
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">，当放行时间&gt;起飞时间 15 分钟及以上时，根据差值计算。</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Fixed Row Height and Overflow Tasks */}
              <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                  <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
                  固定行高与折叠任务
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/60 dark:bg-orange-900/10 dark:border-orange-900/30 space-y-2">
                    <div className="inline-flex h-7 items-center gap-1 rounded-full bg-orange-500 px-3 text-xs font-black text-white shadow-sm">
                      +N 项
                      <span className="material-symbols-outlined text-[15px]">expand_more</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      鼠标悬停可预览<b className="font-bold text-gray-900 dark:text-white">被折叠</b>任务胶囊；点击<b className="font-bold text-gray-900 dark:text-white">展开所有</b>任务胶囊。
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 dark:bg-gray-800/60 dark:border-gray-700 space-y-2">
                    <div className="inline-flex h-7 items-center gap-1 rounded-full border border-slate-300 bg-white px-3 text-xs font-black text-slate-700 shadow-sm">
                      收起
                      <span className="material-symbols-outlined text-[15px]">expand_less</span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      点击<b className="font-bold text-gray-900 dark:text-white">收起</b>按钮收起任务胶囊。
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-blue-800 dark:text-blue-300">
                      <span className="material-symbols-outlined text-lg">priority_high</span>
                      折叠顺序
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                      依次折叠超时完成、临期预警、关联告警、超时未完成。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: INTERACTIONS */}
          {activeTab === 'interactions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <section className="space-y-3">
                <div className="p-3.5 sm:p-4 rounded-xl border border-violet-100 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-900/30 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">1</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">顶部视图与批量展开</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-normal">
                      点击<b className="font-bold text-gray-900 dark:text-white">穿透视图/管控视图</b>切换视图入口状态；右侧<b className="font-bold text-gray-900 dark:text-white">全部展开/全部收起</b>按钮可一次调整当前航班列表。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-blue-100 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">2</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">航班详情与标记添加</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-normal">
                      点击左侧航班卡片打开<b className="font-bold text-gray-900 dark:text-white">航班详情</b>。点击标记末尾的<b className="font-bold text-gray-900 dark:text-white">“+”</b>选择并添加航班标记；已添加项不可重复选择。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-purple-100 bg-purple-50/50 dark:bg-purple-900/10 dark:border-purple-900/30 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">3</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">保障胶囊与航班管控</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-normal">
                      点击<b className="font-bold text-gray-900 dark:text-white">任务胶囊</b>打开<b className="font-bold text-gray-900 dark:text-white">胶囊详情与航班管控</b>，提供查看<b className="font-bold text-gray-900 dark:text-white">全生命周期管控记录</b>、下发<b className="font-bold text-gray-900 dark:text-white">「多级管控」</b>或<b className="font-bold text-gray-900 dark:text-white">「穿透管控」</b>指令等功能。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/30 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">4</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">右键菜单与弱化显示</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-normal">
                      任务胶囊上右键弹出<b className="font-bold text-gray-900 dark:text-white">可控/可消除</b>，将该任务置灰弱化，再次右键可<b className="font-bold text-gray-900 dark:text-white">恢复</b>。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-amber-100 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30 flex items-start gap-3.5 shadow-sm hover:shadow-md transition-all">
                  <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">5</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">时间轴缩放与搜索</h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-0.5 leading-normal">
                      提供<b className="font-bold text-gray-900 dark:text-white">时间轴刻度比例缩放</b>、<b className="font-bold text-gray-900 dark:text-white">航班号搜索(日期必选)</b>等功能。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          )}

        </div>
    </MotionModalShell>
  );
};
