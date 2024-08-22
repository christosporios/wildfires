"use client";
import { WildfireSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { MapContainer, TileLayer } from "react-leaflet";
import Fires from "./Fires";
import { useState, useEffect } from 'react';
export default function MiniMap({ wildfire, play, className }: { wildfire: WildfireSummary, play: boolean, className: string }) {
    const { theme } = useTheme();
    const start = new Date(wildfire.wildfire.start).getTime();
    const end = wildfire.wildfire.end ? new Date(wildfire.wildfire.end).getTime() : new Date().getTime();

    const [currentTime, setCurrentTime] = useState<number>(start);

    useEffect(() => {
        if (!play) {
            setCurrentTime(start);
            return;
        }

        const interval = setInterval(() => {
            setCurrentTime((prevTime: number) => {
                const newTime = prevTime + (end - start) / 10;
                return newTime > end ? start : newTime;
            });
        }, 500);

        return () => clearInterval(interval);
    }, [play, wildfire.wildfire.start, wildfire.wildfire.end]);

    const progress = ((currentTime - start) / (end - start)) * 100;

    return (
        <div className={cn(`w-full h-full ${play ? 'bg-green' : 'bg-yellow'}`, className)}>
            <MapContainer
                center={wildfire.wildfire.position}
                zoom={wildfire.wildfire.zoom - 1.5}
                scrollWheelZoom={true}
                zoomControl={false}
                dragging={false}
                maxZoom={wildfire.wildfire.zoom - 1.5}
                minZoom={wildfire.wildfire.zoom - 1.5}
                style={{ height: '100%', width: '100%' }}>
                attributionControl={false}

                <TileLayer
                    url={(theme === "dark")
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                />

                <Fires fires={wildfire.fires} zuluTime={new Date(currentTime)} />
                <div className="absolute bottom-0 left-0 w-full h-[3px] z-[1000]">
                    <div className="h-full bg-foreground transition-all duration-500 ease-linear" style={{ width: `${progress}%` }}></div>
                </div>
            </MapContainer>
        </div>
    );
}