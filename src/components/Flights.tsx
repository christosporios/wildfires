import React from 'react';
import { Flight } from '../lib/types';
import { Circle, Marker, SVGOverlay, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { SettingsSheet } from './SettingsSheet';
import { Badge } from '@/components/ui/badge';
import { usePageSettings } from '../contexts/SettingsContext';
interface FlightsProps {
    flightData: { [flightId: string]: Flight };
    currentTime: Date;
}

const INTERPOLATE_POSITIONS = true;

export default function Flights({ flightData, currentTime }: FlightsProps) {

    const { isDarkMode, settings } = usePageSettings();
    const currentFlights = Object.values(flightData).filter(flight => {
        const trackPositions = flight.data.flight.track;
        if (trackPositions.length === 0) return false;
        const firstTimestamp = trackPositions[0].timestamp * 1000;
        const lastTimestamp = trackPositions[trackPositions.length - 1].timestamp * 1000;
        return firstTimestamp <= currentTime.getTime() && lastTimestamp >= currentTime.getTime();
    });
    return (
        <>
            <SettingsSheet />
            {currentFlights.map(flight => {
                const trackPositions = flight.data.flight.track;
                let latestPosition;
                let trail: { latitude: number; longitude: number; timestamp: number }[] = [];

                const currentTimeMs = currentTime.getTime();
                const fifteenMinutesAgo = currentTimeMs - 15 * 60 * 1000;
                const filteredPositions = trackPositions.filter(pos => pos.timestamp * 1000 > fifteenMinutesAgo && pos.timestamp * 1000 <= currentTimeMs);

                if (INTERPOLATE_POSITIONS && filteredPositions.length >= 2) {
                    const prevIndex = filteredPositions.findIndex(pos => pos.timestamp * 1000 > currentTimeMs) - 1;

                    if (prevIndex >= 0 && prevIndex < filteredPositions.length - 1) {
                        const prevPos = filteredPositions[prevIndex];
                        const nextPos = filteredPositions[prevIndex + 1];
                        const timeDiff = nextPos.timestamp - prevPos.timestamp;
                        const fraction = (currentTimeMs / 1000 - prevPos.timestamp) / timeDiff;

                        latestPosition = {
                            latitude: prevPos.latitude + (nextPos.latitude - prevPos.latitude) * fraction,
                            longitude: prevPos.longitude + (nextPos.longitude - prevPos.longitude) * fraction,
                            heading: prevPos.heading + (nextPos.heading - prevPos.heading) * fraction,
                            timestamp: currentTimeMs / 1000
                        };
                    } else {
                        latestPosition = filteredPositions[filteredPositions.length - 1];
                    }
                } else {
                    latestPosition = filteredPositions.length > 0
                        ? filteredPositions.reduce((latest, current) =>
                            current.timestamp > latest.timestamp ? current : latest
                        )
                        : trackPositions[trackPositions.length - 1];
                }

                // Only generate trail if showAircraftTrails is true in settings
                if (settings.showAircraftTrails) {
                    // Generate trail for the last 30 minutes, keeping at most one position per 10 seconds
                    const thirtyMinutesAgo = currentTime.getTime() - 30 * 60 * 1000;
                    let lastTenSeconds = -1;
                    trail = trackPositions.filter(pos => {
                        const posTime = pos.timestamp * 1000;
                        if (posTime <= currentTime.getTime() && posTime > thirtyMinutesAgo) {
                            const posTenSeconds = Math.floor(pos.timestamp / 10);
                            if (posTenSeconds !== lastTenSeconds) {
                                lastTenSeconds = posTenSeconds;
                                return true;
                            }
                        }
                        return false;
                    });
                }

                return (
                    <React.Fragment key={flight.data.flight.identification.id}>
                        <Aircraft
                            position={[latestPosition.latitude, latestPosition.longitude]}
                            heading={latestPosition.heading}
                            altitude={latestPosition.altitude}
                            speed={latestPosition.speed}
                            identification={flight.data.flight.identification}
                            aircraft={flight.data.flight.aircraft}
                        />
                        {settings.showAircraftTrails && trail.map((pos, index) => (
                            <Circle
                                key={`${flight.data.flight.identification.id}-trail-${index}`}
                                center={[pos.latitude, pos.longitude]}
                                radius={2}
                                pathOptions={{ fillColor: isDarkMode() ? '#fff' : '#000', fillOpacity: 0.5, stroke: false }}
                            />
                        ))}
                    </React.Fragment>
                );
            })}
        </>
    );
}
function Aircraft({ position, heading, identification, aircraft, altitude, speed }: { position: [number, number], heading: number, identification: Flight["data"]["flight"]["identification"], aircraft: Flight["data"]["flight"]["aircraft"], altitude?: { feet: number, meters: number }, speed?: { kmh: number, kts: number, mph: number } }) {
    const { settings } = usePageSettings();
    const formattedAltitude = altitude
        ? settings.units.altitude === 'meters'
            ? `${Math.round(altitude.meters * 0.3048)} m`
            : `${altitude.feet} ft`
        : undefined;

    const formattedSpeed = speed
        ? settings.units.aircraftSpeed === 'kmh'
            ? `${Math.round(speed.kmh * 1.852)} km/h`
            : `${speed.kts} kts`
        : undefined;

    return (
        <Marker position={position} icon={new DivIcon({
            html: `
                <div style="transform: rotate(${heading}deg); margin-top: -5px; margin-left: -10px;">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" style="filter: drop-shadow(1px 1px 1px rgba(0,0,0,0.5));">
                    <path fill="#000000" d="M12 2L2 14h20L12 2zm0 4l6 6H6l6-6z"/>
                    <path fill="#ffffff" d="M12 3L3 13.5h18L12 3zm0 3.5l4.5 4.5H7.5l4.5-4.5z"/>
                </svg>
                </div>
            `,
            className: 'custom-div-icon'
        })}>
            <Tooltip className='bg-background bg-black ml-2'>
                <div className="flex flex-col">
                    <div className="flex justify-between items-center gap-2">
                        <span>{identification.callsign}</span>
                        <Badge className=''>{aircraft.model.code}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                        {altitude && <span>{formattedAltitude}</span>}
                        {speed && <span>{formattedSpeed}</span>}
                    </div>
                </div>
            </Tooltip>
        </Marker>
    );
}