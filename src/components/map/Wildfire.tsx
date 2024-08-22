"use client";
import { LatLngTuple } from 'leaflet';
import React, { useEffect, useState } from 'react';
import Timeline from '../wildfire/Timeline';
import { Weather as WeatherType, ParsedMetar, WildfireData, Flight, Fire, AnnouncementsData } from '../../lib/types';
import Weather from '../wildfire/Weather';
import { SettingsSheet } from '../wildfire/SettingsSheet';
import { LocalizedSettingsProvider as SettingsProvider } from '../../contexts/SettingsContext';
import { usePageSettings } from '../../contexts/SettingsContext';
import dynamic from 'next/dynamic';
import { Events } from '../wildfire/Events';
import { Event as WildfireEvent } from '../../lib/types';
import DataLoader from '../wildfire/DataLoader';

const Fires = dynamic(() => import('./Fires'), {
    ssr: false,
    loading: () => <p>Loading fires...</p>
});

const Flights = dynamic(() => import('./Flights'), {
    ssr: false,
    loading: () => <p>Loading flights...</p>
});

const MapComponent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <p>Loading map...</p>
});

const Announcements = dynamic(() => import('./Announcements'), {
    ssr: false,
    loading: () => <p>Loading announcements...</p>
});

export default function Wildfire({ wildfireId }: { wildfireId: string }) {
    const [zuluTime, setZuluTime] = useState(new Date());
    const [wildfireData, setWildfireData] = useState<WildfireData | null>(null);
    const [events, setEvents] = useState<WildfireEvent[]>([]);

    let onLoaded = (data: WildfireData) => {
        let events: WildfireEvent[] = data.announcements.announcements.map((announcement) => {
            return {
                timestamp: announcement.timestamp,
                type: "112",
                description: announcement.type === 'alert' ? `high alert for ${announcement.from.join(', ')}` : `evacuate from ${announcement.from.join(', ')} to ${announcement.to?.join(', ')}`
            };
        });

        setEvents(events);
        setWildfireData(data);
    }

    if (!wildfireData) {
        return <DataLoader loaded={onLoaded} wildfireId={wildfireId} />
    }

    return (
        <SettingsProvider zuluTime={zuluTime} location={wildfireData.wildfire.position} timezone={wildfireData.wildfire.timezone}>
            <MainContent
                wildfireData={wildfireData}
                zuluTime={zuluTime}
                setZuluTime={setZuluTime}
                events={events}
            />
        </SettingsProvider>
    )
}

function MainContent({
    wildfireData,
    zuluTime,
    setZuluTime,
    events
}: {
    wildfireData: WildfireData;
    zuluTime: Date;
    setZuluTime: React.Dispatch<React.SetStateAction<Date>>;
    events: WildfireEvent[];
}) {
    const { settings } = usePageSettings();

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden">
            <MapComponent position={wildfireData.wildfire.position} zoom={wildfireData.wildfire.zoom}>
                {settings.dataLayers.flights && (
                    <Flights flightData={wildfireData.flights} zuluTime={zuluTime} />
                )}

                {settings.dataLayers.fires && (
                    <Fires fires={wildfireData.fires} zuluTime={zuluTime} />
                )}

                {settings.dataLayers.evacuationOrders && (
                    <div className="absolute top-4 left-4 z-[1000]">
                        <Announcements announcements={wildfireData.announcements} zuluTime={zuluTime} />
                    </div>
                )}
            </MapComponent>
            <SettingsSheet wildfire={wildfireData.wildfire} />
            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
                <Events zuluTime={zuluTime} events={events} />
                <Timeline startDate={new Date(wildfireData.wildfire.start)} endDate={wildfireData.wildfire.end ? new Date(wildfireData.wildfire.end) : new Date()} tick={setZuluTime} timezone={wildfireData.wildfire.timezone} />
            </div>
            {
                settings.dataLayers.weather && (
                    <div className="absolute top-4 right-4 z-[1000]">
                        <Weather metars={wildfireData.metars} zuluTime={zuluTime} />
                    </div>
                )
            }
        </div >
    )
}