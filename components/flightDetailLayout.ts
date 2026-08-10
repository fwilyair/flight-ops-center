import type { Flight } from '../types.ts';
import { getFlightCardLegPresence } from './flightCardLayout.ts';

export const getFlightDetailTimeLayout = (flight: Flight) => {
    const presence = getFlightCardLegPresence(flight);
    const hasBothLegs = presence.arrival && presence.departure;

    return {
        showPreviousDeparture: presence.arrival,
        showArrivalTimes: presence.arrival,
        showDepartureTimes: presence.departure,
        showDepartureControlTimes: presence.departure,
        rowGridClass: hasBothLegs
            ? 'grid-cols-[80px_1fr_1fr]'
            : 'grid-cols-[80px_1fr]',
    } as const;
};
