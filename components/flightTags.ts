// 示例候选项：后续接入后端接口时，用接口返回的同结构数据替换此数组即可。
export const FLIGHT_TAG_OPTIONS = [
    '冰',
    'Q',
    '控',
    'C',
    'I',
    'D',
    'V',
    '互天',
    '机',
    '重要',
] as const;

export type FlightTag = (typeof FLIGHT_TAG_OPTIONS)[number];

// 详情面板沿用业务状态强调色，不与高密度航班列表的区分配色混用。
export const flightDetailTagColorMap: Record<string, string> = {
    '冰': 'bg-blue-500',
    'Q': 'bg-blue-600',
    '控': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-cyan-500',
    'I': 'bg-green-700',
    'D': 'bg-red-600',
    'V': 'bg-orange-600',
    '互天': 'bg-purple-600',
    '机': 'bg-indigo-500',
    '重要': 'bg-rose-500',
};

// 列表卡片需在小尺寸内保持高区分度，与详情面板的业务强调色分开。
export const flightCardTagColorMap: Record<string, string> = {
    '冰': 'bg-blue-500',
    'Q': 'bg-blue-600',
    '控': 'bg-yellow-400 text-yellow-900',
    'C': 'bg-red-500',
    'I': 'bg-purple-500',
    'D': 'bg-orange-500',
    'V': 'bg-teal-500',
    '互天': 'bg-cyan-600',
    '机': 'bg-indigo-500',
    '重要': 'bg-rose-600',
};

export const addFlightTag = (tags: string[] | undefined, tag: FlightTag): string[] => {
    const currentTags = tags ?? [];
    return currentTags.includes(tag) ? currentTags : [...currentTags, tag];
};

export const getCenteredTagPickerPosition = (
    panelRect: Pick<DOMRect, 'left' | 'width'>,
    anchorRect: Pick<DOMRect, 'bottom'>,
) => ({
    left: panelRect.left + panelRect.width / 2,
    top: anchorRect.bottom + 12,
});
