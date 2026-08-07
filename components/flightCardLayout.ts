import type { Flight, FlightType } from '../types';
import { addFlightTag } from './flightTags.ts';
import type { FlightTag } from './flightTags.ts';

export type FlightLeg = 'arrival' | 'departure';

export const getLegTags = (flight: Flight, leg: FlightLeg): string[] =>
    (leg === 'arrival' ? flight.arrTags : flight.depTags) ?? flight.tags ?? [];

export const getLegFlightType = (flight: Flight, leg: FlightLeg): FlightType | undefined =>
    (leg === 'arrival' ? flight.arrFlightType : flight.depFlightType) ?? flight.flightType;

export const getTypeVisibility = (arrivalType: FlightType | undefined, departureType: FlightType | undefined) => {
    if (!arrivalType && !departureType) return { arrival: false, departure: false };
    if (!arrivalType) return { arrival: false, departure: true };
    if (!departureType) return { arrival: true, departure: false };
    return { arrival: true, departure: arrivalType !== departureType };
};

export const getFlightNumberSizeClass = (flightNo: string): string =>
    flightNo.length >= 8
        ? 'text-[12px] tracking-[-0.65px]'
        : 'text-[17px]';

export const getTagDisplay = (tags: string[], capacity: number) => {
    if (tags.length <= capacity) return { visibleTags: tags, hiddenCount: 0 };

    const visibleCount = Math.max(0, capacity - 1);
    return {
        visibleTags: tags.slice(0, visibleCount),
        hiddenCount: tags.length - visibleCount,
    };
};

export const addFlightTagToLeg = (flight: Flight, leg: FlightLeg, tag: FlightTag): Flight => {
    const arrTags = leg === 'arrival'
        ? addFlightTag(getLegTags(flight, 'arrival'), tag)
        : getLegTags(flight, 'arrival');
    const depTags = leg === 'departure'
        ? addFlightTag(getLegTags(flight, 'departure'), tag)
        : getLegTags(flight, 'departure');

    return {
        ...flight,
        arrTags,
        depTags,
        tags: Array.from(new Set([...arrTags, ...depTags])),
    };
};
