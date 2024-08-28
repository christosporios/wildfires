"use client";
import { Wildfire, WildfireSummary } from "@/lib/types";
import WildfireCard from "./WildfireCard";
import { BaseSettingsProvider as SettingsProvider } from "@/contexts/SettingsContext";
import { Github } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Footer } from "../Footer";
import { Header } from "../Header";

export default function Main() {
    const [wildfires, setWildfires] = useState<Wildfire[] | null>(null);
    const [activeCardId, setActiveCardId] = useState<string | null>(null);
    const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        fetch(process.env.NEXT_PUBLIC_WILDFIRES_API + "/wildfires")
            .then(res => res.json())
            .then(data => setWildfires(data));
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerWidth <= 768) { // Assuming mobile breakpoint is 768px
                let highestVisibleCard: string | null = null;
                let highestY = Infinity;

                Object.entries(cardRefs.current).forEach(([id, ref]) => {
                    if (ref) {
                        const rect = ref.getBoundingClientRect();
                        if (rect.top >= 0 && rect.top < highestY) {
                            highestY = rect.top;
                            highestVisibleCard = id;
                        }
                    }
                });

                setActiveCardId(highestVisibleCard);
            } else {
                setActiveCardId(null);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Call once to set initial state

        return () => window.removeEventListener('scroll', handleScroll);
    }, [wildfires]);

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
                                        <div key={id} ref={(el: HTMLDivElement | null) => { if (el) cardRefs.current[`${year}-${id}`] = el }}>
                                            <WildfireCard
                                                wildfire={wildfire}
                                                active={activeCardId === `${year}-${id}`}
                                            />
                                        </div>
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