"use client";
import { Wildfire, WildfireSummary } from "@/lib/types";
import WildfireCard from "./WildfireCard";
import { BaseSettingsProvider as SettingsProvider } from "@/contexts/SettingsContext";
import { Github } from "lucide-react";
import { useEffect, useState } from "react";
import { Footer } from "../Footer";
import { Header } from "../Header";

export default function Main() {
    const [wildfires, setWildfires] = useState<Wildfire[] | null>(null);

    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_WILDFIRES_API + "/wildfires")
            .then(res => res.json())
            .then(data => setWildfires(data));
    }, []);

    if (!wildfires) {
        return <div>Loading...</div>;
    }

    const wildfiresByYear = wildfires.reduce((acc: { [key: string]: Wildfire[] }, wildfire) => {
        const year = new Date(wildfire.start).getFullYear();
        if (!acc[year]) {
            acc[year] = [];
        }
        acc[year].push(wildfire);
        return acc;
    }, {});

    let mostRecentFirst = (a: string, b: string) => {
        const yearA = parseInt(a);
        const yearB = parseInt(b);
        return yearB - yearA;
    }

    return (
        <>
            <SettingsProvider>

                <Header />
                <div className="container mx-auto">
                    <main>
                        {Object.keys(wildfiresByYear).sort(mostRecentFirst).map((year) => (
                            <div key={year} className="mb-16">
                                <h2 className="text-xl my-8">{year}</h2>
                                <div className="flex flex-wrap gap-4">
                                    {wildfiresByYear[year].map((wildfire, id) => (
                                        <WildfireCard key={id} wildfire={wildfire} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </main>
                    <Footer />
                </div>
            </SettingsProvider>
        </>
    );
}