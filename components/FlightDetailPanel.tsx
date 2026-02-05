import React from 'react';
import { Flight } from '../types';

interface FlightDetailPanelProps {
    flight: Flight | null;
    isOpen: boolean;
    onClose: () => void;
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
}) => {
    if (!flight) return null;

    return (
        <>
            {/* Backdrop - z-index lower than flight cards (z-40) so cards remain clickable */}
            <div
                className={`fixed inset-0 bg-black/20 dark:bg-black/40 z-[35] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{ boxShadow: 'var(--shadow-md), -4px 0 20px rgba(0,0,0,0.1)' }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between h-14 px-4 border-b"
                    style={{ borderColor: 'var(--border-color)', background: 'var(--bg-card)' }}
                >
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">航班详情</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-gray-500 dark:text-gray-400">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-3.5rem)]">
                    {/* Flight Numbers - Centered, same size, matching left panel colors */}
                    <div className="bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-900/30 dark:to-indigo-900/30 rounded-2xl p-5 border border-sky-100 dark:border-sky-800 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-center gap-3">
                            <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 font-mono tracking-tight tabular-nums">
                                {flight.flightNo.split(' / ')[0]}
                            </span>
                            {flight.codeshare && (
                                <>
                                    <span className="text-2xl text-slate-300 dark:text-slate-600 font-light select-none">/</span>
                                    <span className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono tracking-tight tabular-nums">
                                        {flight.codeshare}
                                    </span>
                                </>
                            )}
                        </div>
                        {/* Route - Displayed below flight number, no icon */}
                        <div className="mt-3 flex items-center justify-center">
                            <span className="text-lg font-bold text-slate-600 dark:text-slate-300 tracking-wide">
                                {flight.route || 'CTU - PEK'}
                            </span>
                        </div>
                    </div>

                    {/* Aircraft & Gate Info - 5 items in one row */}
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { label: '机位', value: flight.arrInfo?.stand || flight.stand || '-' },
                            { label: '登机口', value: flight.depInfo?.gate || flight.gate || '-' },
                            { label: '机号', value: flight.registration || '-' },
                            { label: '机型', value: flight.aircraftType || '-' },
                            { label: '机类', value: flight.aircraftCategory || '-' },
                        ].map((item) => (
                            <div key={item.label} className="bg-white dark:bg-gray-800/60 p-2 rounded-xl border border-gray-100 dark:border-gray-700/50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center min-h-[65px]">
                                <div className="text-[10px] text-gray-400 dark:text-gray-500 mb-0.5 font-medium uppercase tracking-wide whitespace-nowrap">
                                    {item.label}
                                </div>
                                <div className="text-sm font-bold text-gray-900 dark:text-white font-mono tabular-nums whitespace-nowrap">{item.value}</div>
                            </div>
                        ))}
                    </div>



                    {/* Times Table */}
                    <div className="bg-white dark:bg-gray-800/40 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden">
                        <div className="text-sm divide-y divide-gray-100 dark:divide-gray-700/50">
                            {/* 前站起飞 */}
                            <div className="grid grid-cols-[80px_1fr] p-3 hover:bg-gray-50/50 transition-colors bg-orange-50/30">
                                <div className="text-gray-900 dark:text-gray-100 font-bold">前站起飞</div>
                                <div className="font-mono tabular-nums text-gray-700 dark:text-gray-200 font-bold text-center pr-10">
                                    {formatTime(flight.times?.ptd)}
                                </div>
                            </div>
                            {/* 计划时间 */}
                            <div className="grid grid-cols-[80px_1fr_1fr] p-3 hover:bg-gray-50/50 transition-colors">
                                <div className="text-gray-900 dark:text-gray-100 font-bold">计划时间</div>
                                <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                    {formatTime(flight.times?.sta)}
                                </div>
                                <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                    {formatTime(flight.times?.std)}
                                </div>
                            </div>
                            {/* 预计时间 */}
                            <div className="grid grid-cols-[80px_1fr_1fr] p-3 hover:bg-gray-50/50 transition-colors bg-gray-50/30 dark:bg-gray-800/30">
                                <div className="text-gray-900 dark:text-gray-100 font-bold">预计时间</div>
                                <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                    {formatTime(flight.times?.eta)}
                                </div>
                                <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                    {formatTime(flight.times?.etd)}
                                </div>
                            </div>
                            {/* 实际时间 */}
                            <div className="grid grid-cols-[80px_1fr_1fr] p-3 hover:bg-gray-50/50 transition-colors">
                                <div className="text-gray-900 dark:text-gray-100 font-bold">实际时间</div>
                                <div className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold text-center">
                                    {formatTime(flight.times?.ata)}
                                </div>
                                <div className="font-mono tabular-nums text-blue-600 dark:text-blue-400 font-bold text-center">
                                    {formatTime(flight.times?.atd)}
                                </div>
                            </div>
                            {/* COBT & CTOT */}
                            <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700/50">
                                <div className="p-3">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold mb-1">COBT</div>
                                    <div className="font-mono tabular-nums text-gray-900 dark:text-gray-100 font-bold text-lg">{formatTime(flight.times?.cobt)}</div>
                                </div>
                                <div className="p-3 pl-5">
                                    <div className="text-gray-900 dark:text-gray-100 font-bold mb-1">CTOT</div>
                                    <div className="font-mono tabular-nums text-gray-900 dark:text-gray-100 font-bold text-lg">{formatTime(flight.times?.ctot)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
