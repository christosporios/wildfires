import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { parse, formatISO } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';
import { Wildfire } from '../src/lib/types';
interface Announcement {
    tweetUrl: string;
    dateString: string;
    timestamp: number;
    type: string;
    from: string[];
    to?: string[];
}

interface AnnouncementsData {
    areaNames: string[];
    announcements: Announcement[];
}

interface CoordinatesMap {
    [areaName: string]: [number, number];
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const TIMEZONE = 'Europe/Athens';


async function getCoordinates(areaName: string, wildfireId: string): Promise<[number, number]> {
    try {
        const wildfireData: Wildfire = JSON.parse(fs.readFileSync(path.join('./data', wildfireId, 'wildfire.json'), 'utf-8'));
        const [[lat1, lon1], [lat2, lon2]] = wildfireData.boundingBox;
        const minLat = Math.min(lat1, lat2);
        const maxLat = Math.max(lat1, lat2);
        const minLon = Math.min(lon1, lon2);
        const maxLon = Math.max(lon1, lon2);

        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: `${areaName}, Attiki, Greece`,
                key: GOOGLE_API_KEY
            }
        });


        if (response.data.results.length > 0) {
            for (let i = 0; i < response.data.results.length; i++) {
                const { lat, lng } = response.data.results[i].geometry.location;
                if (lat >= minLat && lat <= maxLat && lng >= minLon && lng <= maxLon) {
                    if (i > 0) {
                        console.warn(`Did not pick first result for ${areaName}, because it was out of bounds. Result #${i + 1} was within bounds.`);
                    }
                    return [lat, lng];
                }
            }
            console.warn(`No result was within bounds for ${areaName}`);
            return [response.data.results[0].geometry.location.lat, response.data.results[0].geometry.location.lng];
        } else {
            throw new Error(`No results found for ${areaName}`);
        }
    } catch (error) {
        console.error(`Error getting coordinates for ${areaName}:`, error);
        throw error;
    }
}

function parseDateString(dateString: string): number {
    const parsedDate = parse(dateString, "yyyy-MM-dd'T'HH:mm:ss", new Date());
    const utcDate = fromZonedTime(parsedDate, TIMEZONE);
    return utcDate.getTime() / 1000;
}

async function processAnnouncements(wildfireId: string): Promise<void> {
    const inputPath = path.join('./data', wildfireId, 'inputs', 'announcements', 'announcements.json');
    const outputPath = path.join('./data', wildfireId, 'announcements.json');

    const data: AnnouncementsData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
    const coordinatesMap: CoordinatesMap = {};

    for (const areaName of data.areaNames) {
        try {
            coordinatesMap[areaName] = await getCoordinates(areaName, wildfireId);
            console.log(`Processed: ${areaName} -> ${coordinatesMap[areaName]}`);
        } catch (error) {
            console.error(`Error processing ${areaName}:`, error);
        }
    }

    const processedAnnouncements = data.announcements.map(announcement => ({
        ...announcement,
        timestamp: parseDateString(announcement.dateString)
    }));

    const outputData = {
        ...data,
        announcements: processedAnnouncements,
        areaCoordinates: coordinatesMap
    };

    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Processed announcements saved to ${outputPath}`);
}

// Usage
const wildfireId = process.argv[2];
if (!wildfireId) {
    console.error('Please provide a wildfireId as an argument');
    process.exit(1);
}

processAnnouncements(wildfireId).catch(console.error);
