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
        case '管控':
            return { dot: 'bg-emerald-500', text: 'text-emerald-700', label: 'bg-emerald-100 text-emerald-800' };
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
    const [isControlModalOpen, setIsControlModalOpen] = React.useState(false);
    const [controlText, setControlText] = React.useState('');
    const [localLifecycle, setLocalLifecycle] = React.useState<TaskLifecycleEvent[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isClosingControl, setIsClosingControl] = React.useState(false);

    const handleCloseControlModal = () => {
        setIsClosingControl(true);
        setTimeout(() => {
            setIsControlModalOpen(false);
            setIsClosingControl(false);
            setControlText('');
        }, 200);
    };

    // Initialize local lifecycle state when event changes
    React.useEffect(() => {
        if (event?.lifecycle) {
            setLocalLifecycle(event.lifecycle);
        }
    }, [event]);

    const shortcuts = [
        "请及时到位",
        "注意保障时间，特殊情况请及时偏离上报",
        "设备故障，请协调备用设备",
        "收到请回复"
    ];

    const handleShortcutClick = (text: string) => {
        setControlText(text);
    };

    const handleSubmitControl = () => {
        if (!controlText.trim() || !event) return;

        setIsSubmitting(true);

        // Simulate network delay for better UX
        setTimeout(() => {
            console.log('Control submitted:', controlText);

            // Create new control event
            const now = new Date();
            const timestamp = `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

            const newEvent: TaskLifecycleEvent = {
                id: `ctrl_${Date.now()}`,
                type: '管控',
                timestamp: timestamp,
                description: `已管控${event.label}：${controlText}`
            };

            // Update local state (prepend to show at top)
            setLocalLifecycle(prev => [newEvent, ...prev]);

            // Here you would typically call an API to persist this

            setIsSubmitting(false);
            handleCloseControlModal();
            if (onControl) onControl();
        }, 600);
    };

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

            {/* Main Capsule Detail Modal */}
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
                                    {(localLifecycle || []).map((lc, index) => {
                                        const styles = getLifecycleTypeStyle(lc.type);
                                        return (
                                            <div key={lc.id} className="relative flex items-start gap-3">
                                                {/* Dot */}
                                                <div className={`absolute -left-[13px] top-[5px] w-2.5 h-2.5 rounded-full ${styles.dot} ring-2 ring-white shadow-sm`}></div>

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
                        onClick={() => setIsControlModalOpen(true)}
                        className="w-full py-3 rounded-xl font-bold text-white text-lg tracking-wide bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:via-orange-500 hover:to-amber-500 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                        管控
                    </button>
                </div>
            </div>

            {/* Control Detail Modal (Overlay) */}
            {isControlModalOpen && (
                <>
                    {/* Unique Backdrop for Control Modal */}
                    <div
                        className={`fixed inset-0 bg-black/60 z-[100] transition-opacity duration-200 ${isClosingControl ? 'opacity-0' : 'opacity-100'}`}
                        onClick={handleCloseControlModal}
                    />

                    <div
                        className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white z-[110] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-200 ${isClosingControl ? 'opacity-0 scale-95' : 'animate-in fade-in zoom-in-95'}`}
                    >
                        {/* Header */}
                        <div className="relative px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-900 tracking-wide">发布管控内容</span>
                            <button
                                onClick={handleCloseControlModal}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 bg-gray-50/50">
                            {/* Input Area */}
                            <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-orange-100 focus-within:border-orange-200 transition-all">
                                <textarea
                                    value={controlText}
                                    onChange={(e) => setControlText(e.target.value)}
                                    placeholder="请输入管控内容..."
                                    className="w-full h-24 p-3 resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-base"
                                ></textarea>
                            </div>

                            {/* Shortcuts List */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    快捷用语
                                </div>
                                <div className="divide-y divide-gray-50 max-h-[160px] overflow-y-auto">
                                    {shortcuts.map((shortcut, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleShortcutClick(shortcut)}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors truncate"
                                        >
                                            {shortcut}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="p-4 bg-white border-t border-gray-100 flex justify-center">
                            <button
                                onClick={handleSubmitControl}
                                disabled={isSubmitting}
                                className={`px-10 py-2.5 bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 hover:from-orange-600 hover:via-orange-500 hover:to-amber-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed active:scale-100' : ''}`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>提交中...</span>
                                    </>
                                ) : (
                                    <span>提交</span>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
