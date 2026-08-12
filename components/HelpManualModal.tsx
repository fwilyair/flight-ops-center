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
      panelClassName="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl h-[780px] max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800"
    >
        {/* Modal Header */}
        <div data-motion-modal-content className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 font-bold shadow-inner">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                穿透视图 <span className="text-xs font-mono font-normal text-slate-500 dark:text-slate-400 ml-1.5 px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800">OPERATIONAL MANUAL</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">航班控制中心保障与时间轴可视化操作指引</p>
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

          {/* TAB 1: OVERVIEW (Re-designed with Anti-Slop Editorial Craft) */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              
              {/* Operational Hero Status Grid */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-indigo-600"></span>
                    STATUS COLOR MATRIX / 系统状态调色盘
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">5 INDICATORS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Card 1: 正常完成 / Completed */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="size-2.5 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.4)]" />
                        正常完成
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        ON TIME
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      保障节点或检查项在计划范围内按时完成。
                    </p>
                  </div>

                  {/* Card 2: 超时完成 / Overtime Completed */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all duration-200 hover:border-amber-500/50 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="size-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                        超时完成
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                        DELAYED COMPLETE
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      任务已完成，但实际耗时超出了预定计划阈值。
                    </p>
                  </div>

                  {/* Card 3: 超时未完成 / Overtime Incomplete */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all duration-200 hover:border-rose-500/50 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="size-2.5 rounded-full bg-rose-600 shadow-[0_0_8px_rgba(225,29,72,0.4)]" />
                        超时未完成
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                        CRITICAL OVERDUE
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      任务已超过计划时间且尚未录入完成，需重点关注。
                    </p>
                  </div>

                  {/* Card 4: 关联告警 / Cascade Alert */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all duration-200 hover:border-purple-500/50 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="size-2.5 rounded-full bg-purple-600 shadow-[0_0_8px_rgba(147,51,234,0.4)]" />
                        关联告警
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                        CASCADE RISKS
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      受到前序关联保障节点延误影响的后续推演任务。
                    </p>
                  </div>

                  {/* Card 5: 临期预警 / Approaching Warning */}
                  <div className="group relative overflow-hidden rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                        <span className="size-2.5 rounded-full bg-cyan-600 shadow-[0_0_8px_rgba(8,145,178,0.4)]" />
                        临期预警
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full">
                        UPCOMING
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      距离计划节点不足预警窗口时间，即将到期的任务。
                    </p>
                  </div>

                  {/* Card 6: 延误航班底色 / Flight Card Status */}
                  <div className="group relative overflow-hidden rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/80 dark:bg-rose-950/20 p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-rose-950 dark:text-rose-200">
                        <span className="size-2.5 rounded-full bg-rose-500" />
                        延误航班状态
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/50 px-2 py-0.5 rounded-full">
                        FLIGHT CARD
                      </span>
                    </div>
                    <p className="mt-2.5 text-xs text-rose-800/80 dark:text-rose-300/80 leading-relaxed">
                      进港或出港标注“延误”的航班，卡片与抽屉自动渲染淡粉底色。
                    </p>
                  </div>
                </div>
              </section>

              {/* Interactive Timeline Cursor Section */}
              <section className="space-y-3.5">
                <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600"></span>
                  TIMELINE CURSOR & INDICATOR / 时间轴游标说明
                </h3>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/60 pb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-mono text-xs font-black shadow-sm">
                        13:57
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">系统当前时间游标</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">全局红色贯穿实线指示此时此刻。按 <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">Space</kbd> 快捷键快速平滑归中。</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-700/60 pb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-mono text-xs font-black shadow-sm">
                        11:00
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">计划时间基线点（绿色圆点）</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">保障节点计划开展时间。鼠标悬停胶囊时，顶部时间轴刻度同步出现高亮辅助引导线。</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-purple-600 text-white font-mono text-xs font-black shadow-sm">
                        11:10
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">修正计划时间点（紫色圆点）</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">当放行时间比计划起飞时间推迟 15 分钟及以上时，系统自动智能推算出的推演修正节点。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 2: FOUR INSPECTIONS (Re-designed for Excellence) */}
          {activeTab === 'inspections' && (
            <div className="space-y-8 animate-in fade-in duration-200">

              {/* Section 1: The 4 Action Buttons */}
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-indigo-600"></span>
                    FOUR GUARANTEE ACTION BUTTONS / 四项保障检查面板
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">EXTENDED DRAWER TAB</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Button 入 */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-2.5 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs shadow-sm">
                          入
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">入位检查</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                        进港 / 连班
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      关联进港保障节点。弹窗展示<b className="text-slate-800 dark:text-slate-200">勤务接机到位、客运接机到位、进港摆渡车到位、客梯车到位</b>等关键参考节点。
                    </p>
                  </div>

                  {/* Button 登 */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-2.5 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs shadow-sm">
                          登
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">登机检查</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                        出港 / 连班
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      关联旅客登机保障。弹窗展示<b className="text-slate-800 dark:text-slate-200">机上清洁结束时间、允许登机时间</b>等关键参考时间。
                    </p>
                  </div>

                  {/* Button 推 */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-2.5 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs shadow-sm">
                          推
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">推出检查</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                        出港 / 连班
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      关门与推出准备。展示<b className="text-slate-800 dark:text-slate-200">关舱门、关货门、撒轮挡、登机桥到位、牵引车到位、电子进程单</b>等参考节点。
                    </p>
                  </div>

                  {/* Button 允 */}
                  <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-2.5 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 font-bold text-xs shadow-sm">
                          允
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">允许登机</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 text-[11px] font-bold">
                        专属时间组件
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      点击弹出单一时间提交组件（带 <b className="text-slate-800 dark:text-slate-200">x 清空按钮</b>）。清空后提交即可一键退回到未操作状态。
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2: 4 Button States */}
              <section className="space-y-3.5">
                <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600"></span>
                  4 BUTTON FILL STATES / 4 种状态视觉样式
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 gap-2 text-center">
                    <span className="flex size-7 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 text-xs font-normal shadow-sm">
                      入
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">1. 未操作</span>
                    <span className="text-[11px] font-mono text-slate-400">白色空心边框</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/30 bg-rose-50/60 dark:bg-rose-950/20 gap-2 text-center">
                    <span className="flex size-7 items-center justify-center rounded-full border border-rose-500 bg-rose-500 text-white text-xs font-normal shadow-sm">
                      登
                    </span>
                    <span className="text-xs font-bold text-rose-900 dark:text-rose-300">2. 超时未完成</span>
                    <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400">红色实心填充</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/30 bg-amber-50/60 dark:bg-amber-950/20 gap-2 text-center">
                    <span className="flex size-7 items-center justify-center rounded-full border border-amber-500 bg-amber-500 text-white text-xs font-normal shadow-sm">
                      推
                    </span>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">3. 超时完成</span>
                    <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">黄色实心填充</span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/30 bg-emerald-50/60 dark:bg-emerald-950/20 gap-2 text-center">
                    <span className="flex size-7 items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-white text-xs font-normal shadow-sm">
                      允
                    </span>
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">4. 正常完成</span>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">绿色实心填充</span>
                  </div>
                </div>
              </section>

              {/* Section 3: Flight Type Adaptation */}
              <section className="space-y-3.5">
                <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-600"></span>
                  FLIGHT TYPE ADAPTATION / 航班腿按需动态适配
                </h3>

                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">单进航班</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">仅有到达腿（如 3U8888）</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">入</span>
                      <span className="text-xs text-slate-400 italic">（仅保留 1 个进港检查按钮）</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">单出航班</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">仅有出发腿（如 Y87502）</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">登</span>
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">推</span>
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">允</span>
                      <span className="text-xs text-slate-400 italic">（保留 3 个出港检查按钮）</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-bold text-xs">连班航班</span>
                      <span className="text-xs text-slate-600 dark:text-slate-300">过站连班（如 CA1538/1539）</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">入</span>
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">登</span>
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">推</span>
                      <span className="flex size-6 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] text-slate-600">允</span>
                      <span className="text-xs text-slate-400 italic">（完整展示 4 个按钮）</span>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          )}

          {/* TAB 3: EVENTS & CAPSULES (Kept Original as Requested by User) */}
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
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">默认保障状态</p>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-900/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-visible">
                      <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="16" ry="16" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'dashMarch 2s linear infinite' }} />
                    </svg>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-amber-900 dark:text-amber-300">2. 橙黄虚线旋转框</span>
                    </div>
                    <div className="relative h-11 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-between px-4 text-sm font-bold text-amber-900 dark:text-amber-200 shadow-inner">
                      <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-full overflow-visible">
                        <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="22" ry="22" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6 4" style={{ animation: 'dashMarch 2s linear infinite' }} />
                      </svg>
                      <span>推出开车</span>
                      <span>计 14:20 | 实 --:--</span>
                    </div>
                    <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">任务预警/处理中</p>
                  </div>

                  <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-emerald-900 dark:text-emerald-300">3. 渐变实线框</span>
                    </div>
                    <div className="h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 border-2 border-emerald-500 flex items-center justify-between px-4 text-sm font-bold text-emerald-900 dark:text-emerald-200 shadow-inner">
                      <span>开始卸载</span>
                      <span>计 10:30 | 实 10:29</span>
                    </div>
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">已回执确认完成</p>
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

          {/* TAB 4: INTERACTIONS (Re-designed with Keyboard & Feature Cards) */}
          {activeTab === 'interactions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <section className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-indigo-600"></span>
                    FEATURE & INTERACTION GUIDE / 常用交互与快捷操作
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">SHORTCUTS & ACTIONS</span>
                </div>

                <div className="space-y-3">
                  {/* Action 1: 批量展开收起 */}
                  <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        01
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          一键批量展开 / 收起全图航班
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-600 dark:text-slate-300 font-mono font-semibold">
                            HEADER CONTROL
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          点击界面左上角固定粘性头的 <b className="text-slate-800 dark:text-slate-200">全部展开 / 全部收起</b> 按钮，可一键批量展开或收起所有航班行内部折叠的多条任务轨道。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action 2: 快捷键 Space */}
                  <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        02
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          快捷键 Space / 恢复时间归中
                          <kbd className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            Space
                          </kbd>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          当在甘特图上自由横向拖拽浏览后，随时按下的键盘 <kbd className="px-1 py-0.2 rounded border border-slate-300 dark:border-slate-700 font-mono text-[10px]">Space</kbd> 空格键，页面将瞬间平滑滚动回系统当前时间红线位置。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action 3: 右键菜单弱化 */}
                  <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        03
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          右键快捷菜单 / 标记“可控 / 可消除”
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-semibold">
                            RIGHT CLICK
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          在任意任务胶囊上右键唤出菜单，点击 <b className="text-slate-800 dark:text-slate-200">可控 / 可消除</b>，即可将该胶囊视觉置灰弱化；再次右键选择 <b className="text-slate-800 dark:text-slate-200">恢复</b> 即可重置。
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action 4: 航班标记与监控视频 */}
                  <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800/80 p-4 transition-all hover:border-indigo-500/40 hover:shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs">
                        04
                      </span>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          航班标记加选与监控视频入口
                          <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 text-[10px] font-mono font-semibold">
                            FLIGHT CARD
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          点击航班卡片上的 <b className="text-slate-800 dark:text-slate-200 font-bold">“+”</b> 开启全量 Tag 选择器；点击蓝色播放图标快速弹出该航班保障现场的监控视频。
                        </p>
                      </div>
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
