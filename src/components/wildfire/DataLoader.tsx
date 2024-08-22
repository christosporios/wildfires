import { useEffect, useState } from "react";
import { getWildfire, getFlights, getFires, getAnnouncements, getMetars } from "@/lib/getWildfireData";
import { WildfireData } from "@/lib/types";
import { Loader } from 'lucide-react';

export default function DataLoader({ loaded, wildfireId }: { loaded: (data: WildfireData) => void, wildfireId: string }) {
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