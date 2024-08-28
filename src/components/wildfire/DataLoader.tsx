import { useEffect, useState } from "react";
import { TimedEvent, Wildfire, WildfireData, WildfireSummary } from "@/lib/types";
import { Loader } from 'lucide-react';

export default function DataLoader({ loaded, wildfireId }: { loaded: (data: WildfireData) => void, wildfireId: string }) {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<string>("Loading wildfire data...");
    const [wildfireInfo, setWildfireInfo] = useState<Wildfire | null>(null);

    async function getWildfire(wildfireId: string): Promise<Wildfire> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const wildfires = await response.json();
        const wildfire = wildfires.find((w: any) => w.id === wildfireId);
        if (!wildfire) {
            throw new Error(`Wildfire with id ${wildfireId} not found`);
        }
        return wildfire as Wildfire;
    }

    async function getWildfireEventsAndRecency(wildfireId: string, start: Date, end: Date): Promise<{ events: TimedEvent[], recency: { [key: string]: { from: Date | null, to: Date | null } } }> {
        const response = await fetch(`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires/${wildfireId}?from=${start.toISOString()}&to=${end.toISOString()}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    }

    const combineRecencies = (recency1: { [key: string]: { from: Date | null, to: Date | null } }, recency2: { [key: string]: { from: Date | null, to: Date | null } }) => {
        const combined = { ...recency1 };
        for (const key in recency2) {
            if (recency1[key] && recency1[key].to && recency2[key].to && recency2[key].to > recency1[key].to) {
                combined[key].to = recency2[key].to;
            }
            if (recency1[key] && recency1[key].from && recency2[key].from && recency2[key].from < recency1[key].from) {
                combined[key].from = recency2[key].from;
            }
        }
        return combined;
    }

    useEffect(() => {
        async function loadData() {
            try {
                // First, get the wildfire info
                const wildfire = await getWildfire(wildfireId);
                setWildfireInfo(wildfire);

                const startTime = new Date(wildfire.start);
                const endTime = wildfire.end ? new Date(wildfire.end) : new Date();
                const totalDuration = endTime.getTime() - startTime.getTime();
                const intervalDuration = 36 * 60 * 60 * 1000; // 36 hours in milliseconds
                const intervals = Math.ceil(totalDuration / intervalDuration);

                let allEvents: TimedEvent[] = [];
                let totalRecency: { [key: string]: { from: Date | null, to: Date | null } } = {};

                for (let i = 0; i < intervals; i++) {
                    const intervalStart = new Date(startTime.getTime() + i * intervalDuration);
                    const intervalEnd = new Date(Math.min(intervalStart.getTime() + intervalDuration, endTime.getTime()));

                    console.log(`Loading events from ${intervalStart} to ${intervalEnd}`)
                    const eventsAndRecency = await getWildfireEventsAndRecency(
                        wildfire.id,
                        intervalStart,
                        intervalEnd
                    );
                    console.log(`Loaded ${eventsAndRecency.events.length} events`);

                    allEvents = allEvents.concat(eventsAndRecency.events);
                    totalRecency = combineRecencies(totalRecency, eventsAndRecency.recency);

                    setProgress(Math.round(((i + 1) / intervals) * 100));
                    setStatus(`${Math.round(((i + 1) / intervals) * 100)}% loaded`);
                }

                const wildfireData: WildfireData = {
                    wildfire,
                    events: allEvents,
                    recency: totalRecency
                };

                setStatus("100% loaded");
                console.log(`Loaded ${wildfireData.events.length} events`)
                // Print event counts per type and percentage
                const eventCounts = allEvents.reduce((acc, event) => {
                    acc[event.event] = (acc[event.event] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                const totalEvents = allEvents.length;

                console.log("Event counts and percentages per type:");
                Object.entries(eventCounts).forEach(([eventType, count]) => {
                    const percentage = ((count / totalEvents) * 100).toFixed(2);
                    console.log(`${eventType}: ${count} (${percentage}%)`);
                });

                // Print recency information
                console.log("Recency information:");
                Object.entries(totalRecency).forEach(([key, value]) => {
                    console.log(`${key}: from ${value.from}, to ${value.to}`);
                });
                loaded(wildfireData);
            } catch (error) {
                console.error("Error loading data:", error);
                setStatus("Error loading data. Please try again.");
            }
        }

        loadData();
    }, [loaded, wildfireId]);

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