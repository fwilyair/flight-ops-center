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

// Status translation map
const STATUS_MAP_CN: Record<string, string> = {
    'completed': '正常完成',
    'overtime-completed': '超时完成',
    'overtime-incomplete': '超时未完',
    'delayed': '延误',
    'active': '保障中',
    'pending': '未开始',
    'normal': '正常',
    'warning': '异常',
    'alert': '告警'
};

export const CapsuleDetailModal: React.FC<CapsuleDetailModalProps> = ({
    isOpen,
    onClose,
    event,
    flightNo,
    codeshare,
    onControl
}) => {
    // ... hooks

    // Helper to get status text
    const getStatusText = (status: string) => STATUS_MAP_CN[status] || status;

    // ... rest of component

    // In Render:
    // ... hooks
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
                description: controlText
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
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] max-h-[90vh] z-[90] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                <div className="relative px-5 py-6 bg-white z-20 border-b border-gray-100 shadow-sm flex-none">
                    {/* Title content - Centered */}
                    <div className="flex items-center justify-center relative">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight tabular-nums">{flightNo}</span>
                                {codeshare && (
                                    <>
                                        <span className="text-gray-300 text-2xl font-light">/</span>
                                        <span className="text-3xl font-black text-blue-600 font-mono tracking-tight tabular-nums">{codeshare}</span>
                                    </>
                                )}
                            </div>

                            {/* Restored Task Details - Text Based - Consistent Font Size - Increased Gap */}
                            <div className="flex items-center gap-12 mt-2 text-lg font-bold text-gray-800">
                                <span>{event.label}</span>
                                {timeDiff !== null && (
                                    <>
                                        <span className="w-px h-5 bg-gray-300"></span>
                                        <span className={`font-mono ${timeDiffColor}`}>
                                            {timeDiff > 0 ? `+${timeDiff}` : timeDiff} min
                                        </span>
                                    </>
                                )}
                                <span className="w-px h-5 bg-gray-300"></span>
                                <span className="text-gray-500">{getStatusText(event.status)}</span>
                            </div>
                        </div>

                        {/* Close button - Absolute positioned right - REMOVED */}
                    </div>
                </div>

                {/* Content area with liquid flow background */}
                {/* Content area with liquid flow background */}
                <div className="flex-1 overflow-y-auto relative bg-white flex flex-col-reverse p-6">
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white to-blue-50/30 pointer-events-none sticky top-0"></div>

                    {/* Chat Stream */}
                    <div className="relative z-10 flex flex-col gap-5 w-full">
                        {/* Combine and sort specific events and local lifecycle for display */}
                        {[...localLifecycle]
                            .sort((a, b) => {
                                // Simple string comparison for hh:mm format assuming same day
                                return a.timestamp.localeCompare(b.timestamp);
                            })
                            .map((lc) => {
                                // Determine message type and styling based on event type
                                let alignment = 'self-start'; // Default Left (Field)
                                let bubbleStyle = 'bg-gray-100 text-gray-700';

                                // Colors for bubbles (content)
                                if (['预警', '催办'].includes(lc.type)) {
                                    alignment = 'self-center';
                                    if (lc.type === '预警') {
                                        bubbleStyle = 'bg-orange-50 text-orange-600 border border-orange-100';
                                    } else { // 催办
                                        bubbleStyle = 'bg-rose-50 text-rose-600 border border-rose-100';
                                    }
                                } else if (lc.type === '管控') {
                                    alignment = 'self-end';
                                    // Light Green as requested (matching avatar)
                                    bubbleStyle = 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm';
                                } else {
                                    // Default Task Blue
                                    bubbleStyle = 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm';
                                }

                                // Layout Container Base
                                const containerBase = "flex items-center gap-3 max-w-[90%]";

                                // Parse timestamp to MM-DD HH:mm
                                // If format is YYYY-MM-DD HH:mm, remove YYYY-
                                let timeStr = lc.timestamp;
                                if (timeStr.split('-').length === 3) {
                                    timeStr = timeStr.split('-').slice(1).join('-').trim();
                                }

                                // Special rendering for Center messages (System Alerts)
                                if (['预警', '催办'].includes(lc.type)) {
                                    return (
                                        <div key={lc.id} className={`${alignment} flex flex-col items-center gap-1 my-3`}>
                                            <div className="text-xs text-gray-500 font-bold font-mono mb-1">{timeStr}</div>
                                            <div className={`${bubbleStyle} px-6 py-2 rounded-full text-sm font-medium shadow-sm flex items-center gap-2`}>
                                                <span className="font-bold">{lc.type}</span>
                                                <span className="w-px h-3 bg-current opacity-30"></span>
                                                <span>{lc.description}</span>
                                            </div>
                                        </div>
                                    );
                                }

                                // Right (Control/Me)
                                if (lc.type === '管控') {
                                    return (
                                        <div key={lc.id} className={`${alignment} ${containerBase} flex-row-reverse`}>
                                            {/* Integrated Bubble: [Label | Content] */}
                                            <div className={`${bubbleStyle} px-6 py-2 rounded-3xl text-sm leading-relaxed shadow-sm max-w-[90%] flex items-start gap-3`}>
                                                <span className="font-bold whitespace-nowrap">{lc.type}</span>
                                                <span className="w-px h-4 bg-current opacity-30 mt-1 flex-shrink-0"></span>
                                                <span>{lc.description}</span>
                                            </div>

                                            {/* Time */}
                                            <div className="text-xs text-gray-500 font-bold font-mono self-center ml-2">{timeStr}</div>
                                        </div>
                                    );
                                }

                                // Left (Task/Field)
                                return (
                                    <div key={lc.id} className={`${alignment} ${containerBase}`}>
                                        {/* Integrated Bubble: [Label | Content] */}
                                        <div className={`${bubbleStyle} px-6 py-2 rounded-3xl text-sm leading-relaxed shadow-sm max-w-[90%] flex items-start gap-3`}>
                                            <span className="font-bold whitespace-nowrap">{lc.type}</span>
                                            <span className="w-px h-4 bg-current opacity-30 mt-1 flex-shrink-0"></span>
                                            <span>{lc.description}</span>
                                        </div>

                                        {/* Time */}
                                        <div className="text-xs text-gray-500 font-bold font-mono self-center mr-2">{timeStr}</div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Chat Input Area (Footer) - Fixed at bottom */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex-none z-20">
                    <div className="flex flex-col gap-3">
                        {/* Shortcuts Row */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-right">
                            {shortcuts.map((shortcut, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleShortcutClick(shortcut)}
                                    className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all duration-200 shadow-sm whitespace-nowrap max-w-[150px] truncate hover:scale-105 hover:shadow-md"
                                    title={shortcut}
                                >
                                    {shortcut}
                                </button>
                            ))}
                        </div>

                        {/* Input & Send */}
                        <div className="flex items-end gap-2">
                            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all overflow-hidden flex items-center">
                                <textarea
                                    value={controlText}
                                    onChange={(e) => setControlText(e.target.value)}
                                    placeholder="输入管控指令..."
                                    className="w-full max-h-[100px] min-h-[44px] py-2.5 px-4 resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent text-sm leading-relaxed"
                                    rows={1}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmitControl();
                                        }
                                    }}
                                ></textarea>
                            </div>

                            <button
                                onClick={handleSubmitControl}
                                disabled={isSubmitting || !controlText.trim()}
                                className={`w-11 h-11 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 active:scale-95 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100 shrink-0`}
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
