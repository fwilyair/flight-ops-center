import React from 'react';
import { Flight } from '../types';

interface FlightDetailPanelProps {
    flight: Flight | null;
    isOpen: boolean;
    onClose: () => void;
    onFlightUpdate?: (flight: Flight) => void;
}

// Format time to HH:MM(DD) format
const formatTime = (time?: string): string => {
    if (!time || time === '--:--') return '--:--';
    // For now, assume current day (05) - in production this would use actual date
    const day = '05';
    return `${time}(${day})`;
};

export const FlightDetailPanel: React.FC<FlightDetailPanelProps> = ({
    flight,
    isOpen,
    onClose,
    onFlightUpdate,
}) => {
    const [isEditingRemarks, setIsEditingRemarks] = React.useState(false);
    const [tempRemarks, setTempRemarks] = React.useState('');

    // Reset editing state when flight changes or panel closes
    React.useEffect(() => {
        setIsEditingRemarks(false);
        setTempRemarks('');
    }, [flight?.id, isOpen]);

    if (!flight) return null;

    return (
        <>
            {/* Backdrop - z-index lower than flight cards (z-40) so cards remain clickable */}
            <div
                className={`fixed inset-0 bg-black/20 dark:bg-black/40 z-[35] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Panel - offset from top to not cover timeline */}
            <div
                className={`fixed right-0 w-[400px] shadow-2xl z-[70] transform transition-transform duration-300 ease-out rounded-l-2xl overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{
                    top: '95px',
                    height: 'calc(100vh - 95px)',
                    boxShadow: 'var(--shadow-md), -4px 0 20px rgba(0,0,0,0.1)'
                }}
            >
                {/* White base background */}
                <div className="absolute inset-0 bg-white"></div>

                {/* Unified gradient overlay for entire panel */}
                <div className="absolute inset-0 bg-gradient-to-br from-sky-50/70 via-cyan-50/40 to-blue-50/50"></div>

                {/* Animated liquid blobs - covers entire panel */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Blob 1 - Sky blue */}
                    <div
                        className="absolute w-[500px] h-[500px] rounded-full opacity-60 blur-3xl"
                        style={{
                            background: 'radial-gradient(circle, rgba(135,206,250,0.4) 0%, rgba(135,206,250,0) 70%)',
                            top: '-100px',
                            left: '-100px',
                            animation: 'blob 8s ease-in-out infinite'
                        }}
                    ></div>

                    {/* Blob 2 - Cyan */}
                    <div
                        className="absolute w-[400px] h-[400px] rounded-full opacity-50 blur-3xl"
                        style={{
                            background: 'radial-gradient(circle, rgba(103,232,249,0.35) 0%, rgba(103,232,249,0) 70%)',
                            top: '200px',
                            right: '-50px',
                            animation: 'blob 10s ease-in-out infinite 2s'
                        }}
                    ></div>

                    {/* Blob 3 - Light purple */}
                    <div
                        className="absolute w-[350px] h-[350px] rounded-full opacity-40 blur-3xl"
                        style={{
                            background: 'radial-gradient(circle, rgba(196,181,253,0.3) 0%, rgba(196,181,253,0) 70%)',
                            bottom: '100px',
                            left: '50px',
                            animation: 'blob 12s ease-in-out infinite 4s'
                        }}
                    ></div>

                    {/* Blob 4 - Light pink */}
                    <div
                        className="absolute w-[300px] h-[300px] rounded-full opacity-35 blur-3xl"
                        style={{
                            background: 'radial-gradient(circle, rgba(251,207,232,0.25) 0%, rgba(251,207,232,0) 70%)',
                            top: '400px',
                            left: '150px',
                            animation: 'blob 9s ease-in-out infinite 1s'
                        }}
                    ></div>

                    {/* Blob 5 - Deep sky blue */}
                    <div
                        className="absolute w-[450px] h-[450px] rounded-full opacity-50 blur-3xl"
                        style={{
                            background: 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, rgba(56,189,248,0) 70%)',
                            bottom: '-50px',
                            right: '-100px',
                            animation: 'blob 11s ease-in-out infinite 3s'
                        }}
                    ></div>
                </div>

                {/* CSS Keyframes for blob animation */}
                <style>{`
                    @keyframes blob {
                        0%, 100% {
                            transform: translate(0, 0) scale(1);
                        }
                        25% {
                            transform: translate(30px, -50px) scale(1.1);
                        }
                        50% {
                            transform: translate(-20px, 20px) scale(0.95);
                        }
                        75% {
                            transform: translate(40px, 30px) scale(1.05);
                        }
                    }
                `}</style>

                {/* Header - Centered Title Design */}
                <div
                    className="flex items-center justify-center h-14 relative z-20"
                >
                    <h2 className="text-xl font-bold tracking-[0.25em] uppercase text-amber-700" style={{ fontFamily: "'Noto Sans SC', system-ui, sans-serif" }}>
                        航班详情
                    </h2>
                </div>

                {/* Content */}
                <div className="overflow-y-auto h-[calc(100%-3.5rem)] relative z-10">

                    {/* Content container */}
                    <div className="relative z-10 px-4 pb-4 space-y-5">

                        {/* Flight Numbers */}
                        <div>
                            <div className="flex items-center justify-center gap-3 mt-[12px] mb-[11px]">
                                <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight tabular-nums" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    {flight.flightNo.split(' / ')[0]}
                                </span>
                                {flight.codeshare && (
                                    <>
                                        <span className="text-2xl text-slate-400 font-extralight select-none">/</span>
                                        <span className="text-3xl font-black text-blue-600 font-mono tracking-tight tabular-nums" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                            {flight.codeshare}
                                        </span>
                                    </>
                                )}
                            </div>
                            {/* Route with elegant separator */}
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px w-10 bg-gradient-to-r from-transparent to-slate-300"></div>
                                <span className="text-lg font-bold text-slate-600 tracking-[0.2em] uppercase">
                                    {flight.route || 'CTU - PEK'}
                                </span>
                                <div className="h-px w-10 bg-gradient-to-l from-transparent to-slate-300"></div>
                            </div>
                        </div>

                        {/* Aircraft & Gate Info - 5 items in one row */}
                        <div className="grid grid-cols-5 gap-3">
                            {[
                                { label: '机位', value: flight.arrInfo?.stand || flight.stand || '-' },
                                { label: '登机口', value: flight.depInfo?.gate || flight.gate || '-' },
                                { label: '机号', value: flight.registration || '-' },
                                { label: '机型', value: flight.aircraftType || '-' },
                                { label: '机类', value: flight.aircraftCategory || '-' },
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center justify-center py-2">
                                    <div className="text-[10px] text-slate-400 mb-1 font-medium uppercase tracking-wide">
                                        {item.label}
                                    </div>
                                    <div className="text-sm font-bold text-slate-700 font-mono tabular-nums">{item.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Remarks Section */}
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
                                    航班备注
                                </span>
                                {!isEditingRemarks && (
                                    <button
                                        onClick={() => {
                                            setTempRemarks(flight.remarks || '');
                                            setIsEditingRemarks(true);
                                        }}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline transition-all duration-200 hover:scale-105"
                                    >
                                        编辑
                                    </button>
                                )}
                            </div>

                            {isEditingRemarks ? (
                                <div className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                                    <textarea
                                        value={tempRemarks}
                                        onChange={(e) => setTempRemarks(e.target.value)}
                                        className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none resize-none bg-white text-slate-700 leading-relaxed shadow-inner"
                                        rows={3}
                                        autoFocus
                                        placeholder="请输入航班备注信息..."
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => setIsEditingRemarks(false)}
                                            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-md transition-all duration-200 hover:scale-105"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={() => {
                                                onFlightUpdate?.({ ...flight, remarks: tempRemarks });
                                                setIsEditingRemarks(false);
                                            }}
                                            className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md shadow-sm transition-all duration-200 flex items-center gap-1 hover:scale-105 hover:shadow-md"
                                        >
                                            <span className="material-symbols-outlined text-[14px]">check</span>
                                            保存
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div
                                    className={`text-sm leading-relaxed p-1 rounded-md transition-colors ${flight.remarks ? 'text-slate-700' : 'text-slate-400 italic'
                                        } hover:bg-slate-50/50 cursor-pointer`}
                                    onClick={() => {
                                        setTempRemarks(flight.remarks || '');
                                        setIsEditingRemarks(true);
                                    }}
                                    title="点击编辑备注"
                                >
                                    {flight.remarks || '暂无备注信息，点击添加...'}
                                </div>
                            )}
                        </div>




                        {/* Times Table */}
                        <div className="space-y-0">
                            <div className="text-sm">
                                {/* 前站起飞 */}
                                <div className="grid grid-cols-[80px_1fr] p-3">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold">前站起飞</div>
                                    <div className="font-mono tabular-nums text-gray-700 dark:text-gray-200 font-bold text-center pr-10">
                                        {formatTime(flight.times?.ptd)}
                                    </div>
                                </div>
                                {/* 计划时间 */}
                                <div className="grid grid-cols-[80px_1fr_1fr] p-3">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold">计划时间</div>
                                    <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                        {formatTime(flight.times?.sta)}
                                    </div>
                                    <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                        {formatTime(flight.times?.std)}
                                    </div>
                                </div>
                                {/* 预计时间 */}
                                <div className="grid grid-cols-[80px_1fr_1fr] p-3">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold">预计时间</div>
                                    <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                        {formatTime(flight.times?.eta)}
                                    </div>
                                    <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                        {formatTime(flight.times?.etd)}
                                    </div>
                                </div>
                                {/* 实际时间 */}
                                <div className="grid grid-cols-[80px_1fr_1fr] p-3">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold">实际时间</div>
                                    <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                        {formatTime(flight.times?.ata)}
                                    </div>
                                    <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                        {formatTime(flight.times?.atd)}
                                    </div>
                                </div>
                                {/* COBT & CTOT & ATOT */}
                                <div className="grid grid-cols-3">
                                    <div className="flex flex-col items-center p-3">
                                        <div className="text-gray-900 dark:text-gray-100 font-bold mb-1 italic">COBT</div>
                                        <div className="font-mono tabular-nums text-gray-900 dark:text-gray-100 font-bold text-lg italic">{formatTime(flight.times?.cobt)}</div>
                                    </div>
                                    <div className="flex flex-col items-center p-3 border-l border-slate-100">
                                        <div className="text-gray-900 dark:text-gray-100 font-bold mb-1 italic">CTOT</div>
                                        <div className="font-mono tabular-nums text-gray-900 dark:text-gray-100 font-bold text-lg italic">{formatTime(flight.times?.ctot)}</div>
                                    </div>
                                    <div className="flex flex-col items-center p-3 border-l border-slate-100">
                                        <div className="text-gray-900 dark:text-gray-100 font-bold mb-1 italic">ATOT</div>
                                        <div className="font-mono tabular-nums text-gray-900 dark:text-gray-100 font-bold text-lg italic">{formatTime(flight.times?.atot)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Tasks Section */}
                        {flight.events && flight.events.length > 0 && (
                            <div className="space-y-3">
                                {flight.events.map((event) => {
                                    // Calculate time difference
                                    const calcDiff = () => {
                                        if (!event.timeScheduled || event.timeScheduled === '--:--') return 0;
                                        const [planH, planM] = event.timeScheduled.split(':').map(Number);
                                        const planMins = planH * 60 + planM;

                                        let actualMins: number;
                                        if (event.timeActual && event.timeActual !== '--:--') {
                                            const [actH, actM] = event.timeActual.split(':').map(Number);
                                            actualMins = actH * 60 + actM;
                                        } else {
                                            const now = new Date();
                                            actualMins = now.getHours() * 60 + now.getMinutes();
                                        }
                                        return Math.abs(actualMins - planMins);
                                    };
                                    const diff = calcDiff();

                                    // Status styling using legend colors (matching capsule border)
                                    const getStatusStyle = () => {
                                        switch (event.status) {
                                            case 'overtime-completed':
                                                return {
                                                    bar: 'bg-yellow-500',
                                                    badge: 'bg-yellow-50 text-yellow-900 border-yellow-200',
                                                    cardBorder: 'border-yellow-500',
                                                    label: '超时完成'
                                                };
                                            case 'overtime-incomplete':
                                                return {
                                                    bar: 'bg-red-600',
                                                    badge: 'bg-red-50 text-red-900 border-red-200',
                                                    cardBorder: 'border-red-600',
                                                    label: '超时未完成'
                                                };
                                            case 'alert':
                                                return {
                                                    bar: 'bg-purple-600',
                                                    badge: 'bg-purple-50 text-purple-900 border-purple-200',
                                                    cardBorder: 'border-purple-600',
                                                    label: '关联告警'
                                                };
                                            case 'warning':
                                                return {
                                                    bar: 'bg-cyan-600',
                                                    badge: 'bg-cyan-50 text-cyan-900 border-cyan-200',
                                                    cardBorder: 'border-cyan-600',
                                                    label: '临期预警'
                                                };
                                            default:
                                                return {
                                                    bar: 'bg-gray-300',
                                                    badge: 'bg-gray-50 text-gray-700 border-gray-200',
                                                    cardBorder: 'border-gray-200',
                                                    label: ''
                                                };
                                        }
                                    };
                                    const style = getStatusStyle();

                                    // Only show status badge for relevant statuses
                                    const showBadge = ['overtime-completed', 'overtime-incomplete', 'alert', 'warning'].includes(event.status);

                                    return (
                                        <div
                                            key={event.id}
                                            className={`relative rounded-xl overflow-hidden`}
                                        >
                                            <div className="px-4 py-3">
                                                {/* Row 1: Dot + Title + Diff Badge + Status */}
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Dot indicator inline with title */}
                                                        <div className={`w-2.5 h-2.5 rounded-full ${style.bar} shadow-sm flex-shrink-0`}></div>
                                                        <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                                            {event.label}
                                                        </span>
                                                        <span className={`inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-md text-xs font-bold tabular-nums ${style.badge} border`}>
                                                            {diff}
                                                        </span>
                                                    </div>
                                                    {showBadge && (
                                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${style.badge} border`}>
                                                            {style.label}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Row 2: Plan + Actual times - Redesigned */}
                                                <div className="flex items-center gap-6 mt-1">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-xs text-slate-400 font-medium">计划</span>
                                                        <span className="font-mono font-bold text-base text-slate-600 tabular-nums tracking-tight">{formatTime(event.timeScheduled)}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-xs text-slate-400 font-medium">实际</span>
                                                        <span className="font-mono font-black text-base text-slate-800 tabular-nums tracking-tight">{formatTime(event.timeActual)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
