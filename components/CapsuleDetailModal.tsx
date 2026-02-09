import React from 'react';
import { TimelineEvent, TaskStatus, TaskLifecycleEvent } from '../types';

interface CapsuleDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: TimelineEvent | null;
    flightNo: string;
    codeshare?: string;
    onControl?: () => void;
}

// Task status badge colors (6 types as per user spec)
const getTaskStatusStyle = (status: TaskStatus) => {
    switch (status) {
        case '未发布':
            return 'bg-white text-gray-600 border border-gray-300';
        case '已发布':
            return 'bg-amber-100 text-amber-700 border border-amber-200';
        case '已领受':
            return 'bg-blue-100 text-blue-700 border border-blue-200';
        case '到位':
            return 'bg-emerald-600 text-white';
        case '开始':
            return 'bg-purple-100 text-purple-700 border border-purple-200';
        case '结束':
            return 'bg-gray-200 text-gray-600';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

// Lifecycle event type colors
const getLifecycleTypeStyle = (type: TaskLifecycleEvent['type']) => {
    switch (type) {
        case '催办':
            return { dot: 'bg-red-500', text: 'text-red-600', label: 'bg-red-100 text-red-700' };
        case '预警':
            return { dot: 'bg-orange-500', text: 'text-orange-600', label: 'bg-orange-100 text-orange-700' };
        case '创建':
        case '发布':
        case '领受':
        case '到位':
        case '开始':
        case '结束':
            return { dot: 'bg-blue-500', text: 'text-blue-600', label: 'bg-blue-100 text-blue-700' };
        default:
            return { dot: 'bg-gray-400', text: 'text-gray-600', label: 'bg-gray-100 text-gray-600' };
    }
};

// Calculate time difference in minutes
const calculateTimeDiff = (actual?: string, scheduled?: string): number | null => {
    if (!actual || !scheduled || actual === '--:--' || scheduled === '--:--') return null;

    const [aH, aM] = actual.split(':').map(Number);
    const [sH, sM] = scheduled.split(':').map(Number);

    const actualMins = aH * 60 + aM;
    const scheduledMins = sH * 60 + sM;

    return actualMins - scheduledMins;
};

export const CapsuleDetailModal: React.FC<CapsuleDetailModalProps> = ({
    isOpen,
    onClose,
    event,
    flightNo,
    codeshare,
    onControl
}) => {
    if (!isOpen || !event) return null;

    const timeDiff = calculateTimeDiff(event.timeActual, event.timeScheduled);
    const timeDiffColor = timeDiff === null ? 'text-gray-500' : timeDiff > 0 ? 'text-red-600' : 'text-emerald-600';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-[80] transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] max-h-[85vh] z-[90] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                {/* Header - Solid white background */}
                <div className="relative px-5 py-6 bg-white z-20 border-b border-gray-100 shadow-sm">
                    {/* Title content - Centered */}
                    <div className="flex items-center justify-center relative">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight tabular-nums">{flightNo}</span>
                            {codeshare && (
                                <>
                                    <span className="text-gray-300 text-2xl font-light">/</span>
                                    <span className="text-3xl font-black text-blue-600 font-mono tracking-tight tabular-nums">{codeshare}</span>
                                </>
                            )}
                        </div>

                        {/* Close button - Absolute positioned right */}
                        <button
                            onClick={onClose}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    </div>
                </div>

                {/* Content area with liquid flow background */}
                <div className="flex-1 overflow-y-auto relative bg-white">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30 pointer-events-none"></div>

                    {/* Animated blob - subtle */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div
                            className="absolute w-[300px] h-[300px] rounded-full opacity-30 blur-3xl"
                            style={{
                                background: 'radial-gradient(circle, rgba(135,206,250,0.4) 0%, rgba(135,206,250,0) 70%)',
                                top: '-50px',
                                right: '-50px',
                                animation: 'blob 10s ease-in-out infinite'
                            }}
                        ></div>
                        <div
                            className="absolute w-[250px] h-[250px] rounded-full opacity-25 blur-3xl"
                            style={{
                                background: 'radial-gradient(circle, rgba(196,181,253,0.3) 0%, rgba(196,181,253,0) 70%)',
                                bottom: '100px',
                                left: '-30px',
                                animation: 'blob 12s ease-in-out infinite 2s'
                            }}
                        ></div>
                    </div>

                    {/* CSS Keyframes */}
                    <style>{`
                        @keyframes blob {
                            0%, 100% { transform: translate(0, 0) scale(1); }
                            25% { transform: translate(20px, -30px) scale(1.05); }
                            50% { transform: translate(-15px, 15px) scale(0.95); }
                            75% { transform: translate(25px, 20px) scale(1.02); }
                        }
                    `}</style>

                    <div className="relative z-10 p-5 space-y-5">
                        {/* Task Info Row */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Task Name (was Department) + Diff Badge */}
                                <span className="text-xl font-bold text-gray-900">
                                    {event.label}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${timeDiffColor} bg-opacity-10`}
                                    style={{ backgroundColor: timeDiff === null ? undefined : timeDiff > 0 ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}
                                >
                                    {timeDiff !== null ? (timeDiff >= 0 ? `+${timeDiff}` : timeDiff) : '--'}
                                </span>
                            </div>

                            {/* Task Status Badge */}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getTaskStatusStyle(event.taskStatus || '未发布')}`}>
                                {event.taskStatus || '未发布'}
                            </span>
                        </div>

                        {/* Department & Personnel */}
                        <div className="flex flex-col gap-1.5">

                            <div className="flex items-baseline gap-2">
                                <span className="text-gray-500 font-medium text-sm">保障人员：</span>
                                <span className="text-gray-800 font-medium text-sm">
                                    {event.personnel?.join('、') || '--'}
                                </span>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="pt-2">
                            <div className="relative pl-4">
                                {/* Vertical line */}
                                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-gray-200"></div>

                                {/* Timeline events - already sorted descending from data */}
                                <div className="space-y-4">
                                    {(event.lifecycle || []).map((lc, index) => {
                                        const styles = getLifecycleTypeStyle(lc.type);
                                        return (
                                            <div key={lc.id} className="relative flex items-start gap-3">
                                                {/* Dot */}
                                                <div className={`absolute -left-4 top-1 w-3.5 h-3.5 rounded-full ${styles.dot} ring-2 ring-white shadow-sm`}></div>

                                                {/* Content */}
                                                <div className="flex-1 ml-2">
                                                    {/* Type label + Timestamp */}
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${styles.label}`}>
                                                            {lc.type}
                                                        </span>
                                                        <span className="text-sm text-gray-400 font-mono">
                                                            {lc.timestamp}
                                                        </span>
                                                    </div>

                                                    {/* Description */}
                                                    <p className={`text-sm leading-relaxed ${styles.text}`}>
                                                        {lc.description}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Control Button - Fixed at bottom */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <button
                        onClick={onControl}
                        className="w-full py-3 rounded-xl font-bold text-white text-lg tracking-wide bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:via-orange-500 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        管控
                    </button>
                </div>
            </div>
        </>
    );
};
