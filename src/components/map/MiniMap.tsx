"use client";
import { Fire, Wildfire, WildfireSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { MapContainer, TileLayer } from "react-leaflet";
import Fires from "./Fires";
import { useState, useEffect } from 'react';
import { Loader } from "lucide-react";

export default function MiniMap({ wildfire, play, className }: { wildfire: Wildfire, play: boolean, className: string }) {
    const [fires, setFires] = useState<Fire[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { theme } = useTheme();
    const start = new Date(wildfire.start).getTime();
    const end = wildfire.end ? new Date(wildfire.end).getTime() : new Date().getTime();

    const [currentTime, setCurrentTime] = useState<number>(start);

    useEffect(() => {
        if (!play) {
            setCurrentTime(start);
            return;
        }

        if (!fires) {
            return;
        }

        const interval = setInterval(() => {
            setCurrentTime((prevTime: number) => {
                const newTime = prevTime + (end - start) / 10;
                return newTime > end ? start : newTime;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [play, wildfire.start, wildfire.end, fires]);

    useEffect(() => {
        if (play && !fires && !isLoading) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires/${wildfire.id}?only=fires`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.events) {
                        setFires(data.events);
                    }
                })
                .catch(error => console.error('Error fetching fires:', error))
                .finally(() => setIsLoading(false));
        }
    }, [play, fires, wildfire.id]);

    const progress = ((currentTime - start) / (end - start)) * 100;

    return (
        <div className={cn(`w-full h-full ${play ? 'bg-green' : 'bg-yellow'}`, className)}>
            <MapContainer
                center={wildfire.position}
                zoom={wildfire.zoom - 1.5}
                scrollWheelZoom={true}
                zoomControl={false}
                dragging={false}
                maxZoom={wildfire.zoom - 1.5}
                minZoom={wildfire.zoom - 1.5}
                style={{ height: '100%', width: '100%' }}
                attributionControl={false}
            >
                <TileLayer
                    url={
                        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                />

                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center z-[1000]">
                        <Loader className="animate-spin" />
                    </div>
                ) : fires ? (
                    <Fires fires={fires} zuluTime={new Date(currentTime)} />
                ) : null}

                <div className="absolute bottom-0 left-0 w-full h-[3px] z-[1000]">
                    <div className="h-full bg-foreground transition-all duration-500 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
            </MapContainer>
        </div>
    );
}