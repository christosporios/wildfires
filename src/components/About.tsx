"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { Header } from "./Header";
import { Footer } from "./Footer";

export default function About() {
    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <main>
                    <h2 className="text-3xl font-bold mb-8">About</h2>

                    <section className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4">Datasources</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><em className="font-medium">Fires</em> are collected from <a href="https://firms.modaps.eosdis.nasa.gov/active_fire/" className="text-blue-600 hover:underline">NASA FIRMS</a>.</li>
                            <li><em className="font-medium">Aircraft</em> are collected from <a href="https://opensky-network.org/" className="text-blue-600 hover:underline">OpenSky</a>.</li>
                            <li><em className="font-medium">Weather</em> is from METARs (Meteorological Aerodrome Reports) from nearby airports.</li>
                            <li><em className="font-medium">112 Announcments</em> are scraped and parsed from <a href="https://twitter.com/112Greece" className="text-blue-600 hover:underline">Twitter</a>.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h3 className="text-2xl font-semibold mb-4">Contributing</h3>
                        <div className="space-y-4">
                            <h4 className="text-xl font-medium">Adding new wildfires</h4>
                            <p className="text-gray-700">
                                To add a new wildfire, make a pull request that adds a new file <a href="https://github.com/christosporios/wildfires-api/tree/main/wildfire-configs" className="text-blue-600 hover:underline">to this folder</a>. You&apos;ll need the coordinates of a bounding box that contains the fire, the ICAO identifier of a nearby airfield, and the start and end times of the fire. The API will collect the rest of the data.
                            </p>

                            <h4 className="text-xl font-medium">Code contributions</h4>
                            <p className="text-gray-700">
                                This project is open source and contributions are welcome. You can improve the visualizations by opening pull requests on <a href="https://github.com/christosporios/wildfires" className="text-blue-600 hover:underline">the frontend repository</a>,
                                or work on data quality issues by working on the <a href="https://github.com/christosporios/wildfires-api" className="text-blue-600 hover:underline">backend repository</a>.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-2xl font-semibold mb-4">FAQs</h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium">Am I seeing all firefighting planes?</AccordionTrigger>
                                <AccordionContent className="text-gray-700">
                                    <p>No, for two reasons:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li>Primarily, not all firefighting planes in Greece carry ADS-B transponders.</li>
                                        <li>Secondly, data is sourced from OpenSky, which has imperfect coverage in some regions in Greece.</li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium">Can I use these visualizations for XYZ?</AccordionTrigger>
                                <AccordionContent className="text-gray-700">
                                    Yes, including for commercial purposes, but with no guarantees of any sort. If you require adaptations, please contact me on <a href="https://twitter.com/christosporios" className="text-blue-600 hover:underline">Twitter</a> or <a href="mailto:christos@porios.com" className="text-blue-600 hover:underline">email</a>.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium">Can I use the data for my own research?</AccordionTrigger>
                                <AccordionContent className="text-gray-700">
                                    <p>Yes. In lieu of proper API documentation, you can try these endpoints:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1">
                                        <li><a className='text-blue-600 hover:underline' href={`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires`}>Wildfires list</a></li>
                                        <li><a className='text-blue-600 hover:underline' href={`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires/varnavas`}>All data on the Varnavas wildfire</a></li>
                                        <li><a className='text-blue-600 hover:underline' href={`${process.env.NEXT_PUBLIC_WILDFIRES_API}/wildfires/varnavas?only=announcements&from=2024-08-11T00:00:00Z&to=2024-08-12T23:59:59Z`}>Announcements for the Varnavas fire from August 11 to August 12, 2024</a></li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </section>
                </main>
                <Footer />
            </div>
        </>
    );
}