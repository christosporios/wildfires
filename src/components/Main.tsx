"use client";
import { LatLngTuple } from 'leaflet';
import React, { useEffect, useState } from 'react';
import Timeline from './Timeline';
import { Weather as WeatherType, ParsedMetar, WildfireData, Flight, Fire, AnnouncementsData } from '../lib/types';
import Weather from './Weather';
import { SettingsSheet } from './SettingsSheet';
import { SettingsProvider } from '../contexts/SettingsContext';
import { usePageSettings } from '../contexts/SettingsContext';
import dynamic from 'next/dynamic';
import getWildfireData from '@/lib/getWildfireData';
import { Loader } from 'lucide-react';
import { getMetars, getFlights, getFires, getAnnouncements, getWildfire } from '@/lib/getWildfireData';


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
export default function Main() {
    const [zuluTime, setZuluTime] = useState(new Date());
    const [wildfireData, setWildfireData] = useState<WildfireData | null>(null);

    if (!wildfireData) {
        return <DataLoader loaded={setWildfireData} />
    }


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
function DataLoader({ loaded }: { loaded: (data: WildfireData) => void }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<string>("Loading wildfire data...");

    useEffect(() => {
        async function loadData() {
            try {
                setStatus("Loading wildfire data...");
                const wildfire = await getWildfire();
                setProgress(20);

                setStatus("Loading flights...");
                const flights = await getFlights();
                setProgress(40);

                setStatus("Loading fires...");
                const fires = await getFires();
                setProgress(60);

                setStatus("Loading announcements...");
                const announcements = await getAnnouncements();
                setProgress(80);

                setStatus("Loading weather...");
                const metars = await getMetars();
                setProgress(100);

                setStatus("Done");

                const wildfireData: WildfireData = {
                    wildfire,
                    flights,
                    fires,
                    announcements,
                    metars
                };

                loaded(wildfireData);
            } catch (error) {
                console.error("Error loading data:", error);
                setStatus("Error loading data. Please try again.");
            }
        }

        loadData();
    }, [loaded]);

    return (
        <div className="h-screen w-screen flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center">
                    <Loader className="animate-spin mt-4" />
                    {status}
                </div>
            </div>
        </div>
    );
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
        <div className="fixed inset-0 w-full h-full overflow-hidden">
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