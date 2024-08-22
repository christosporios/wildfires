"use client";
import { WildfireSummary } from "@/lib/types";
import WildfireCard from "./WildfireCard";
import { BaseSettingsProvider as SettingsProvider } from "@/contexts/SettingsContext";
import { Github } from "lucide-react";

export default function Main({ wildfires }: { wildfires: WildfireSummary[] }) {
    const wildfiresByYear = wildfires.reduce((acc: { [key: string]: WildfireSummary[] }, wildfire) => {
        const year = new Date(wildfire.wildfire.start).getFullYear();
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
                <header className="sticky top-0 z-10 h-12 shadow-sm bg-background flex items-center justify-center">
                    <h1 className="text-2xl">Wildfires in Greece</h1>
                </header>
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
                    <footer>
                        <p className="text-center my-4 text-xs">
                            <a href="https://github.com/christosporios/wildfires" target="_blank" rel="noopener noreferrer"><Github className="inline-block mr-2 w-4 h-4" /> Contribute</a>
                            <span className="mx-2 text-muted-foreground">|</span>
                            <a href="https://twitter.com/christosporios">@christosporios</a>
                        </p>
                    </footer>
                </div>
            </SettingsProvider>
        </>
    );
}