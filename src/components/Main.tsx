"use client";
import { LatLngTuple } from 'leaflet';
import React, { useState } from 'react';
import Timeline from './Timeline';
import { Weather as WeatherType, ParsedMetar, WildfireData, Flight } from '../lib/types';
import Weather from './Weather';
import { SettingsSheet } from './SettingsSheet';
import { SettingsProvider } from '../contexts/SettingsContext';
import { usePageSettings } from '../contexts/SettingsContext';
import dynamic from 'next/dynamic';

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

const position = [38.2, 23.9] as LatLngTuple;
export default function Main({ wildfireData }: { wildfireData: WildfireData }) {
    const [zuluTime, setZuluTime] = useState(new Date());

    return (
        <SettingsProvider zuluTime={zuluTime} location={wildfireData.wildfire.position} timezone={wildfireData.wildfire.timezone}>
            <MainContent
                wildfireData={wildfireData}
                zuluTime={zuluTime}
                setZuluTime={setZuluTime}
            />
        </SettingsProvider>
    )
}

function MainContent({
    wildfireData,
    zuluTime,
    setZuluTime,
}: {
    wildfireData: WildfireData;
    zuluTime: Date;
    setZuluTime: React.Dispatch<React.SetStateAction<Date>>;
}) {
    const { settings } = usePageSettings();

    return (
        <div className="h-[100vh] w-full relative">
            <MapComponent position={position} zoom={wildfireData.wildfire.zoom}>
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
            <SettingsSheet />
            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
                <Timeline startDate={new Date(wildfireData.wildfire.start)} endDate={new Date(wildfireData.wildfire.end)} tick={setZuluTime} timezone={wildfireData.wildfire.timezone} />
            </div>
            {settings.dataLayers.weather && (
                <div className="absolute top-4 right-4 z-[1000]">
                    <Weather metars={wildfireData.metars} zuluTime={zuluTime} />
                </div>
            )}

        </div>
    )
}