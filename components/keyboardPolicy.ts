export type KeyboardDismissSurface = 'flight-detail' | 'capsule-detail' | 'help' | 'video';

const ESCAPE_DISMISS_SURFACES = new Set<KeyboardDismissSurface>([
    'flight-detail',
    'capsule-detail',
]);

export const shouldCloseWithEscape = (
    surface: KeyboardDismissSurface,
    key: string,
): boolean => key === 'Escape' && ESCAPE_DISMISS_SURFACES.has(surface);

export const shouldReturnToCurrentTime = (
    key: string,
    code: string,
    isTextEntry: boolean,
): boolean => !isTextEntry && (code === 'Space' || key === ' ');

export type FlightRemarkKeyAction = 'submit' | 'cancel' | null;

export const getFlightRemarkKeyAction = (
    key: string,
    shiftKey: boolean,
): FlightRemarkKeyAction => {
    if (key === 'Escape') return 'cancel';
    if (key === 'Enter' && !shiftKey) return 'submit';
    return null;
};
