import React from 'react';
import { AnnouncementsData } from '../lib/types';
import { Polyline, SVGOverlay } from 'react-leaflet';
import { Circle } from 'react-leaflet';
import { usePageSettings } from '@/contexts/SettingsContext';

interface AnnouncementsProps {
    announcements: AnnouncementsData;
    zuluTime: Date;
}

export default function Announcements({ announcements, zuluTime }: AnnouncementsProps) {
    let fadeTime = 3 * 60 * 60;
    let currentAnnouncements = announcements.announcements.filter(announcement => announcement.timestamp <= zuluTime.getTime() / 1000 && announcement.timestamp > zuluTime.getTime() / 1000 - fadeTime);

    return <>
        {currentAnnouncements.map((announcement, ind) => {
            let fadePercentage = Math.max(0, 1 - (zuluTime.getTime() / 1000 - announcement.timestamp) / fadeTime);
            if (announcement.type === 'alert') {
                return announcement.from.map(area => <Announcement key={ind} type={announcement.type} from={announcements.areaCoordinates[area]} fadePercentage={fadePercentage} />);
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
                            elements.push(<Announcement key={ind} type={announcement.type} from={fromCoords[i]} to={toCoords[j]} fadePercentage={fadePercentage} />);
                        }
                    }

                    return elements;
                }
            }
        })}
    </>;
};

let Announcement = ({ type, from, to, fadePercentage }: { type: string, from: [number, number], to?: [number, number], fadePercentage: number }) => {
    const { isDarkMode } = usePageSettings();
    console.log(from, to);
    if (type === 'alert') {
        return (
            <SVGOverlay bounds={[[from[0] - 0.01, from[1] - 0.01], [from[0] + 0.01, from[1] + 0.01]]}>
                <circle cx="50%" cy="50%" r="45%" fill="orange" opacity={0.3 + fadePercentage * 0.7} />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fill={isDarkMode() ? 'black' : 'white'} fontSize="100%">
                    112
                </text>
            </SVGOverlay>
        )
    } else { // 'evacuation'
        return <></>;
        let bounds = [from, to!];
        let isDirectionSouth = to![0] > from[0];
        let isDirectionEast = to![1] > from[1];
        return <SVGOverlay attributes={{ stroke: 'red' }} bounds={bounds}>
            <rect x="0" y="0" width="100%" height="100%" fill="blue" />
            <circle r="5" cx="10" cy="10" fill="red" />
            <text x="50%" y="50%" stroke="white">
                {isDirectionSouth ? 'S' : 'N'}
                {isDirectionEast ? 'E' : 'W'}
            </text>
        </SVGOverlay>

    }
};
