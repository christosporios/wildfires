import React from 'react';
import { Announcement as AnnouncementT, Coordinates } from '../../lib/types';
import { Marker, Polyline, SVGOverlay, Tooltip } from 'react-leaflet';
import { Circle } from 'react-leaflet';
import { usePageSettings } from '@/contexts/SettingsContext';
import ArrowheadsPolyline from './ArrowheadsPolyline';

interface AnnouncementsProps {
    announcements: AnnouncementT[];
    zuluTime: Date;
}
export default function Announcements({ announcements, zuluTime }: AnnouncementsProps) {
    let { settings } = usePageSettings();
    let fadeTimeSeconds = settings.announcementsFadeTime / 1000;
    let currentAnnouncements = announcements.filter(announcement => announcement.timestamp <= zuluTime.getTime() / 1000 && announcement.timestamp > zuluTime.getTime() / 1000 - fadeTimeSeconds);

    return <>
        {currentAnnouncements.map((announcement, ind) => {
            let fadePercentage = 1 - (zuluTime.getTime() / 1000 - announcement.timestamp) / fadeTimeSeconds;
            if (announcement.type === 'alert') {
                return announcement.from.map((fromObj, jnd) => <Announcement key={`${ind}-${jnd}`} type={announcement.type} from={fromObj.position} fadePercentage={fadePercentage} />);
            } else { // 'evacuation'
                let elements = [];
                for (let i = 0; i < announcement.from.length; i++) {
                    for (let j = 0; j < announcement.to.length; j++) {
                        elements.push(
                            <Announcement
                                key={`${ind}-${i}-${j}`}
                                type={announcement.type}
                                from={announcement.from[i].position}
                                to={announcement.to[j].position}
                                fadePercentage={fadePercentage}
                            />
                        );
                    }
                }
                return elements;
            }
        })}
    </>;
};
let Announcement = ({ type, from, to, fadePercentage }: { type: string, from: Coordinates, to?: Coordinates, fadePercentage: number }) => {
    const { isDarkMode } = usePageSettings();
    if (type === 'alert') {
        return (
            <Circle center={from} radius={500} fillColor="orange" fillOpacity={0.4 + 0.6 * fadePercentage} stroke={false} />
        )
    } else { // 'evacuation'
        let bounds = [from, to!];
        let isDirectionSouth = to![0] < from[0];
        let isDirectionEast = to![1] < from[1];
        let direction = `${isDirectionSouth ? 'S' : 'N'}${isDirectionEast ? 'E' : 'W'}`;

        // Calculate distance between points
        const R = 6371; // Earth's radius in km
        const dLat = (to![0] - from[0]) * Math.PI / 180;
        const dLon = (to![1] - from[1]) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(from[0] * Math.PI / 180) * Math.cos(to![0] * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        // If distance > 1km, calculate new endpoint
        let arrowEnd = to!;
        if (distance > 1) {
            const fraction = 1 / distance;
            arrowEnd = [
                from[0] + (to![0] - from[0]) * fraction,
                from[1] + (to![1] - from[1]) * fraction
            ];
        }

        return (
            <>
                <ArrowheadsPolyline arrowheads={true} positions={[from, arrowEnd]} color="orange" opacity={0.4 + 0.6 * fadePercentage} weight={5} />
            </>
        )
    }
};
