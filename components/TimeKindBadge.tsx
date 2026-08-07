import React from 'react';

interface TimeKindBadgeProps {
    kind: 'scheduled' | 'actual';
}

const BADGE_CONFIG = {
    scheduled: { label: '计划', symbol: '计', colorClass: 'bg-blue-600' },
    actual: { label: '实际', symbol: '实', colorClass: 'bg-green-600' },
} as const;

// 详情与时间轴共用标记，避免同一时间语义出现两套视觉规则。
export const TimeKindBadge: React.FC<TimeKindBadgeProps> = ({ kind }) => {
    const config = BADGE_CONFIG[kind];

    return (
        <span
            aria-label={config.label}
            title={config.label}
            className={`origin-center scale-95 rounded px-1 py-[1px] text-xs font-bold text-white ${config.colorClass}`}
        >
            {config.symbol}
        </span>
    );
};
