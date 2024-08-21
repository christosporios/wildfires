"use server";
import metars from "../../data/varnavas/metars.json";
import { ParsedMetar, Flight, Wildfire, Fire, AnnouncementsData } from "@/lib/types";
import flightData from "../../data/varnavas/flights.json";
import wildfireData from "../../data/varnavas/wildfire.json";
import fires from "../../data/varnavas/fires.json";
import announcements from "../../data/varnavas/announcements.json";

export async function getMetars() {
    return metars as ParsedMetar[];
}

export async function getFlights() {
    return flightData as any as { [flightId: string]: Flight };
}

export async function getWildfire() {
    return wildfireData as any as Wildfire;
}

export async function getFires() {
    return fires as {
        viirs: Fire[];
        modis: Fire[];
    };
}

export async function getAnnouncements() {
    return announcements as any as AnnouncementsData;
}

export default async function getWildfireData() {
    return {
        metars: await getMetars(),
        flights: await getFlights(),
        wildfire: await getWildfire(),
        fires: await getFires(),
        announcements: await getAnnouncements()
    };
}
