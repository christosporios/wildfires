import React from 'react';
import { Coordinates, FlightPing } from '../../lib/types';
import { Circle, Marker, Polyline, SVGOverlay, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { Badge } from '@/components/ui/badge';
import { usePageSettings } from '../../contexts/SettingsContext';

interface FlightsProps {
    pings: FlightPing[];
    zuluTime: Date;
}

const TRAIL_TIME_SPAN = 15 * 60;

export default function Flights({ pings, zuluTime }: FlightsProps) {
    const { isDarkMode, settings } = usePageSettings();
    const sortedPings = pings.sort((a, b) => a.timestamp - b.timestamp);
    const currentFlightPings = sortedPings.filter(ping => ping.timestamp <= zuluTime.getTime() / 1000 && ping.timestamp > zuluTime.getTime() / 1000 - TRAIL_TIME_SPAN);
    const currentFlights = Object.values(currentFlightPings.reduce((acc, ping) => {
        const modeS = ping.icao24;
        if (!acc[modeS]) {
            acc[modeS] = [];
        }
        acc[modeS].push(ping);
        return acc;
    }, {} as { [key: string]: FlightPing[] }));



    return (
        <>
            {currentFlights.map(flight => {
                let latestPosition: FlightPing;
                let trail: Coordinates[] = [];

                const trailTimeSpanAgo = zuluTime.getTime() - TRAIL_TIME_SPAN;

                if (settings.interpolateAircraftPositions && flight.length >= 2) {
                    const prevIndex = flight.findIndex(pos => pos.timestamp * 1000 > zuluTime.getTime()) - 1;

                    if (prevIndex >= 0 && prevIndex < flight.length - 1) { // interpolate
                        const prevPos = flight[prevIndex];
                        const nextPos = flight[prevIndex + 1];
                        const timeDiff = nextPos.timestamp - prevPos.timestamp;
                        const fraction = (zuluTime.getTime() / 1000 - prevPos.timestamp) / timeDiff;

                        // interpolation:
                        latestPosition = {
                            ...prevPos,
                            position: [
                                prevPos.position[0] + (nextPos.position[0] - prevPos.position[0]) * fraction,
                                prevPos.position[1] + (nextPos.position[1] - prevPos.position[1]) * fraction,
                            ],
                            altitude: prevPos.altitude + (nextPos.altitude - prevPos.altitude) * fraction,
                            velocity: prevPos.velocity + (nextPos.velocity - prevPos.velocity) * fraction,
                            verticalSpeed: prevPos.verticalSpeed + (nextPos.verticalSpeed - prevPos.verticalSpeed) * fraction,
                            heading: prevPos.heading + (nextPos.heading - prevPos.heading) * fraction,
                            squawk: prevPos.squawk,
                            timestamp: zuluTime.getTime() / 1000,
                        };
                    } else { // use last
                        latestPosition = flight[flight.length - 1];
                    }
                } else { // use last
                    latestPosition = flight.length > 0
                        ? flight.reduce((latest, current) =>
                            current.timestamp > latest.timestamp ? current : latest
                        )
                        : flight[flight.length - 1];
                }

                // Only generate trail if showAircraftTrails is true in settings
                if (settings.showAircraftTrails) {
                    // Generate trail for the last X minutes, keeping at most one position per 10 seconds
                    let lastTenSeconds = -1;
                    trail = flight.filter(pos => {
                        return true;
                        const posTime = pos.timestamp * 1000;
                        if (posTime <= zuluTime.getTime() / 1000 && posTime > trailTimeSpanAgo * 1000) {
                            const posTenSeconds = Math.floor(pos.timestamp / 10);
                            if (posTenSeconds !== lastTenSeconds) {
                                lastTenSeconds = posTenSeconds;
                                return true;
                            }
                        }
                        return false;
                    }).map(pos => {
                        return pos.position;
                    });
                }

                return (
                    <React.Fragment key={latestPosition.icao24}>
                        <Aircraft
                            position={latestPosition.position}
                            heading={latestPosition.heading}
                            altitude={latestPosition.altitude}
                            speed={latestPosition.velocity}
                            callsign={latestPosition.callsign}
                            icao24={latestPosition.icao24}
                        />
                        {settings.showAircraftTrails && trail.length > 1 && (
                            <Polyline
                                positions={trail}
                                pathOptions={{
                                    color: isDarkMode() ? '#fff' : '#000',
                                    weight: 2,
                                    opacity: 0.5,
                                }}

                                smoothFactor={1}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </>
    );
}

function Aircraft({ position, heading, callsign, icao24, altitude, speed }: { position: [number, number], heading: number, callsign: string, icao24: string, altitude?: number, speed?: number }) {
    const { settings } = usePageSettings();
    const formattedAltitude = altitude
        ? settings.units.altitude === 'meters'
            ? `${Math.round(altitude)} m`
            : `${Math.round(altitude * 3.28084)} ft`
        : undefined;

    const formattedSpeed = speed
        ? settings.units.aircraftSpeed === 'kmh'
            ? `${Math.round(speed * 3.6)} km/h`
            : `${Math.round(speed * 1.94384)} kts`
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
                        <span>{callsign}</span>
                        <Badge className=' font-mono'>{icao24}</Badge>
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