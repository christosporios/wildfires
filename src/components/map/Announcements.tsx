import React from 'react';
import { AnnouncementsData } from '../../lib/types';
import { Marker, Polyline, SVGOverlay, Tooltip } from 'react-leaflet';
import { Circle } from 'react-leaflet';
import { usePageSettings } from '@/contexts/SettingsContext';
import ArrowheadsPolyline from './ArrowheadsPolyline';

interface AnnouncementsProps {
    announcements: AnnouncementsData;
    zuluTime: Date;
}

export default function Announcements({ announcements, zuluTime }: AnnouncementsProps) {
    let { settings } = usePageSettings();
    let fadeTimeSeconds = settings.announcementsFadeTime / 1000;
    let currentAnnouncements = announcements.announcements.filter(announcement => announcement.timestamp <= zuluTime.getTime() / 1000 && announcement.timestamp > zuluTime.getTime() / 1000 - fadeTimeSeconds);

    return <>
        {currentAnnouncements.map((announcement, ind) => {
            let fadePercentage = 1 - (zuluTime.getTime() / 1000 - announcement.timestamp) / fadeTimeSeconds;
            if (announcement.type === 'alert') {
                return announcement.from.map((area, jnd) => <Announcement key={`${ind}-${jnd}`} type={announcement.type} from={announcements.areaCoordinates[area]} fadePercentage={fadePercentage} text={`112: Alert for ${announcement.from}`} />);
            } else { // 'evacuation'
                let fromCoords = announcement.from.map(area => announcements.areaCoordinates[area]);
                let toCoords: [number, number][] = [];
                if (announcement.to) {
                    toCoords = announcement.to.map(area => announcements.areaCoordinates[area]);
                }

                let elements = [];
                for (let i = 0; i < fromCoords.length; i++) {
                    for (let j = 0; j < toCoords.length; j++) {
                        if (fromCoords[i] && toCoords[j]) {
                            elements.push(<Announcement key={`${ind}-${i}-${j}`} type={announcement.type} from={fromCoords[i]} to={toCoords[j]} fadePercentage={fadePercentage} text={`122: Evacuate from ${announcement.from} to ${announcement.to}`} />);
                        }
                    }

                    return elements;
                }
            }
        })}
    </>;
};

let Announcement = ({ type, from, to, fadePercentage, text }: { type: string, from: [number, number], to?: [number, number], fadePercentage: number, text: string }) => {
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

        return (
            <ArrowheadsPolyline arrowheads={true} positions={bounds} color="orange" opacity={0.4 + 0.6 * fadePercentage} weight={5} />
        )

    }
};
