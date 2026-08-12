import React, { useState } from 'react';
import { MotionModalShell } from './MotionModalShell';

interface HelpManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'overview' | 'inspections' | 'events' | 'interactions';

export const HelpManualModal: React.FC<HelpManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <MotionModalShell
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="穿透视图使用手册"
      containerClassName="p-3 sm:p-6 overflow-hidden"
      panelClassName="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[740px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800"
    >
        {/* Modal Header */}
        <div data-motion-modal-content className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold shadow-inner">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                穿透视图使用手册
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">航班保障、时间轴与四项检查操作指引</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭使用手册"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div data-motion-modal-content className="grid grid-cols-4 px-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">space_dashboard</span>
            系统总览
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inspections')}
            className={`w-full py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'inspections'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">task_alt</span>
            四项检查
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('events')}
            className={`w-full py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'events'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">view_timeline</span>
            任务胶囊
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('interactions')}
            className={`w-full py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
              activeTab === 'interactions'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <span className="material-symbols-outlined text-lg">touch_app</span>
            常用操作
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div data-motion-modal-content className="flex-1 overflow-y-auto no-scrollbar p-6 text-slate-700 dark:text-slate-300">

          {/* TAB 1: SYSTEM OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  系统状态图例
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-xs text-amber-900 dark:text-amber-300">超时完成</span>
                    </div>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80">已完成但超出计划时间。</p>
                  </div>

                  <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-rose-600" />
                      <span className="font-bold text-xs text-rose-900 dark:text-rose-300">超时未完成</span>
                    </div>
                    <p className="text-xs text-rose-700/80 dark:text-rose-400/80">已超时且尚未完成。</p>
                  </div>

                  <div className="rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/70 dark:bg-purple-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-purple-600" />
                      <span className="font-bold text-xs text-purple-900 dark:text-purple-300">关联告警</span>
                    </div>
                    <p className="text-xs text-purple-700/80 dark:text-purple-400/80">前序环节延误引发告警。</p>
                  </div>

                  <div className="rounded-xl border border-cyan-200 dark:border-cyan-900 bg-cyan-50/70 dark:bg-cyan-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-cyan-600" />
                      <span className="font-bold text-xs text-cyan-900 dark:text-cyan-300">临期预警</span>
                    </div>
                    <p className="text-xs text-cyan-700/80 dark:text-cyan-400/80">即将达到计划完成节点。</p>
                  </div>

                  <div className="rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/70 dark:bg-pink-950/20 p-3.5 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-pink-500" />
                      <span className="font-bold text-xs text-pink-900 dark:text-pink-300">延误航班</span>
                    </div>
                    <p className="text-xs text-pink-700/80 dark:text-pink-400/80">延误航班自动呈淡粉底色。</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  时间轴与游标说明
                </h3>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-rose-600 text-white font-mono text-xs font-bold">13:57</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">系统当前时间游标（红线）</span>
                    </div>
                    <span className="text-xs text-slate-500">按 <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] font-bold">Space</kbd> 快速归中</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">11:00</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">计划时间节点（绿色圆点）</span>
                    </div>
                    <span className="text-xs text-slate-500">悬停胶囊顶部高亮引线</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-purple-600 text-white font-mono text-xs font-bold">11:10</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">修正计划时间点（紫色圆点）</span>
                    </div>
                    <span className="text-xs text-slate-500">放行推迟 15 分钟以上推算</span>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: FOUR INSPECTIONS */}
          {activeTab === 'inspections' && (
            <div className="space-y-6 animate-in fade-in duration-200">

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  四项保障检查功能
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs">入</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">入位检查</h4>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">单进 / 连班</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">勤务/客运接机、摆渡车/客梯车到位等节点。</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs">登</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">登机检查</h4>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">单出 / 连班</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">客舱清洁完成、允许登机等参考时间。</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs">推</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">推出检查</h4>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded">单出 / 连班</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">关舱门、关货门、撒轮挡、登机桥、牵引车到位。</p>
                  </div>

                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs">允</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">允许登机</h4>
                      </div>
                      <span className="text-[11px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded">单出 / 连班</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">修改/提交允登时间；清空提交可退回未操作状态。</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  按钮 4 种状态样式
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 gap-1 text-center">
                    <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 text-xs font-normal shadow-sm">入</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. 未操作</span>
                    <span className="text-[11px] text-slate-400">白色空心</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50/60 dark:bg-rose-950/20 gap-1 text-center">
                    <span className="flex size-6 items-center justify-center rounded-full border border-rose-500 bg-rose-500 text-white text-xs font-normal shadow-sm">登</span>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-300">2. 超时未完成</span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400">红色实心</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-200 dark:border-amber-950 bg-amber-50/60 dark:bg-amber-950/20 gap-1 text-center">
                    <span className="flex size-6 items-center justify-center rounded-full border border-amber-500 bg-amber-500 text-white text-xs font-normal shadow-sm">推</span>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">3. 超时完成</span>
                    <span className="text-[11px] text-amber-600 dark:text-amber-400">黄色实心</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-200 dark:border-emerald-950 bg-emerald-50/60 dark:bg-emerald-950/20 gap-1 text-center">
                    <span className="flex size-6 items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white text-xs font-normal shadow-sm">允</span>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">4. 正常完成</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">绿色实心</span>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 3: EVENTS & CAPSULES (Content preserved, style synchronized) */}
          {activeTab === 'events' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  任务胶囊框线规则
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">1. 无框线</h4>
                    <div className="h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-between px-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-inner">
                      <span>靠桥</span>
                      <span>计 10:15 | 实 10:18</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">默认保障状态。</p>
                  </div>

                  <div className="relative rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">2. 橙黄虚线旋转框</h4>
                    <div className="relative h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-between px-3 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-inner">
                      <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-full overflow-visible">
                        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="18" ry="18" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5 3" style={{ animation: 'dashMarch 2s linear infinite' }} />
                      </svg>
                      <span>推出开车</span>
                      <span>计 14:20 | 实 --:--</span>
                    </div>
                    <p className="text-xs text-amber-700 dark:text-amber-400">任务预警 / 处理中。</p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">3. 渐变实线框</h4>
                    <div className="h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-between px-3 text-xs font-bold text-emerald-900 dark:text-emerald-200 shadow-inner">
                      <span>开始卸载</span>
                      <span>计 10:30 | 实 10:29</span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">已回执确认完成。</p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  时间刻度点规则
                </h3>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="size-3.5 rounded-full bg-emerald-500 ring-2 ring-white shrink-0" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">绿色圆点：计划时间节点</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="size-3.5 rounded-full bg-purple-500 ring-2 ring-white shrink-0 animate-pulse" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">紫色圆点：修正计划时间点（放行推迟 15 分钟及以上计算）</span>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  固定行高与折叠任务
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-orange-200 dark:border-orange-950 bg-orange-50/60 dark:bg-orange-950/20 p-3 space-y-1.5">
                    <span className="inline-flex h-6 items-center gap-1 rounded-full bg-orange-500 px-2.5 text-[11px] font-bold text-white shadow-sm">
                      +N 项 <span className="material-symbols-outlined text-xs">expand_more</span>
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">悬停预览折叠任务；点击展开。</p>
                  </div>

                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 space-y-1.5">
                    <span className="inline-flex h-6 items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 text-[11px] font-bold text-slate-700 shadow-sm">
                      收起 <span className="material-symbols-outlined text-xs">expand_less</span>
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">点击按钮收起任务轨道。</p>
                  </div>

                  <div className="rounded-xl border border-blue-200 dark:border-blue-950 bg-blue-50/60 dark:bg-blue-950/20 p-3 space-y-1.5">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">折叠优先级顺序</span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">依次折叠超时完成、临期预警、关联告警、超时未完成。</p>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 4: INTERACTIONS */}
          {activeTab === 'interactions' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              <section className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600" />
                  常用交互与快捷操作
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">1</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">一键批量展开 / 收起航班</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">点击表头“全部展开 / 全部收起”按钮，一次性控制所有航班行的折叠轨道。</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">2</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">快捷键 Space 时间归中</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">按空格键 <kbd className="px-1 py-0.2 rounded border border-slate-300 font-mono text-[11px] font-bold">Space</kbd> 瞬间平滑滚动会合系统当前时间红线。</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">3</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">右键胶囊可控 / 可消除</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">右键任务胶囊选择“可控/可消除”将其置灰弱化，再次右键可恢复。</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-3 flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">4</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">航班标记加选与监控视频</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">点击卡片“+”选择标记，点击蓝色播放按钮弹出现场监控视频。</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

        </div>
    </MotionModalShell>
  );
};
