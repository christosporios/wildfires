"use client";
import { LatLngTuple } from 'leaflet';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Timeline from './Timeline';
import { Weather as WeatherType, ParsedMetar, WildfireData, Flight } from '../lib/types';
import Weather from './Weather';
import { SettingsSheet } from './SettingsSheet';
import { SettingsProvider } from '../contexts/SettingsContext';
import { usePageSettings } from '../contexts/SettingsContext';

const MapComponent = dynamic(() => import('./Map'), {
    ssr: false,
    loading: () => <p>Loading map...</p>
});

const Flights = dynamic(() => import('./Flights'), {
    ssr: false,
    loading: () => <p>Loading flights...</p>
});
const position = [38.2, 23.9] as LatLngTuple;
export default function Main({ wildfireData }: { wildfireData: WildfireData }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    return (
        <SettingsProvider currentTime={currentTime} location={wildfireData.wildfire.position}>
            <MainContent
                wildfireData={wildfireData}
                currentTime={currentTime}
                setCurrentTime={setCurrentTime}
            />
        </SettingsProvider>
    )
}

function MainContent({
    wildfireData,
    currentTime,
    setCurrentTime,
}: {
    wildfireData: WildfireData;
    currentTime: Date;
    setCurrentTime: React.Dispatch<React.SetStateAction<Date>>;
}) {
    const { settings } = usePageSettings();

    return (
        <div className="h-[100vh] w-full relative">
            <MapComponent position={position} >
                {settings.dataLayers.flights && (
                    <Flights flightData={wildfireData.flights} currentTime={currentTime} />
                )}
            </MapComponent>
            <SettingsSheet />
            <div className="absolute bottom-0 left-0 right-0 z-[1000]">
                <Timeline startDate={new Date(wildfireData.wildfire.start)} endDate={new Date(wildfireData.wildfire.end)} tick={setCurrentTime} />
            </div>
            {settings.dataLayers.weather && (
                <div className="absolute top-4 right-4 z-[1000]">
                    <Weather metars={wildfireData.metars} currentTime={currentTime} />
                </div>
            )}
        </div>
    )
}