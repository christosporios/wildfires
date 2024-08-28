"use client";
import { LatLngTuple } from 'leaflet';
import React, { useEffect, useState } from 'react';
import Timeline from './Timeline';
import { Metar, WildfireData, FlightPing, Fire, Announcement, PopupEvent } from '../../lib/types';
import Weather from './Weather';
import { SettingsSheet } from './SettingsSheet';
import { LocalizedSettingsProvider as SettingsProvider } from '../../contexts/SettingsContext';
import { usePageSettings } from '../../contexts/SettingsContext';
import dynamic from 'next/dynamic';
import { Events } from './Events';
import DataLoader from './DataLoader';

const Fires = dynamic(() => import('../map/Fires'), {
    ssr: false,
    loading: () => <p>Loading fires...</p>
});

const Flights = dynamic(() => import('../map/Flights'), {
    ssr: false,
    loading: () => <p>Loading flights...</p>
});

const MapComponent = dynamic(() => import('../map/Map'), {
    ssr: false,
    loading: () => <p>Loading map...</p>
});

const Announcements = dynamic(() => import('../map/Announcements'), {
    ssr: false,
    loading: () => <p>Loading announcements...</p>
});

export default function Wildfire({ wildfireId }: { wildfireId: string }) {
    const [zuluTime, setZuluTime] = useState(new Date());
    const [wildfireData, setWildfireData] = useState<WildfireData | null>(null);
    const [events, setEvents] = useState<PopupEvent[]>([]);

    let onLoaded = (data: WildfireData) => {
        let events = data.events.filter((e): e is Announcement => e.event === "announcement")
            .filter((announcement) => announcement.from.length > 0 && (announcement.type === 'alert' || announcement.to?.length > 0))
            .map((announcement) => {
                return {
                    timestamp: announcement.timestamp,
                    type: "112",
                    description: announcement.type === 'alert'
                        ? `high alert for ${announcement.from.map((f) => f.name).join(', ')}`
                        : `evacuate from ${announcement.from.map((f) => f.name).join(', ')} to ${announcement.to!.map((t) => t.name).join(', ')}`
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
    events: PopupEvent[];
}) {
    const { settings } = usePageSettings();

    const flightPings = wildfireData.events.filter((e): e is FlightPing => e.event === "flightPing");
    const fires = wildfireData.events.filter((e): e is Fire => e.event === "fire");
    const metars = wildfireData.events.filter((e): e is Metar => e.event === "metar");
    const announcements = wildfireData.events.filter((e): e is Announcement => e.event === "announcement");

    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden">
            <MapComponent position={wildfireData.wildfire.position} zoom={wildfireData.wildfire.zoom}>
                {settings.dataLayers.flights && (
                    <Flights pings={flightPings} zuluTime={zuluTime} />
                )}

                {settings.dataLayers.fires && (
                    <Fires fires={fires} zuluTime={zuluTime} />
                )}

                {settings.dataLayers.evacuationOrders && (
                    <div className="absolute top-4 left-4 z-[1000]">
                        <Announcements announcements={announcements} zuluTime={zuluTime} />
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
                        <Weather metars={metars} zuluTime={zuluTime} />
                    </div>
                )
            }
        </div >
    )
}