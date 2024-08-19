import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { Wildfire, ParsedMetar } from '../src/lib/types';
import { format } from 'date-fns';


async function getMetars(wildfireId: string): Promise<void> {
    const wildfireDataPath = path.join('./data', wildfireId, 'wildfire.json');
    const wildfire: Wildfire = JSON.parse(fs.readFileSync(wildfireDataPath, 'utf-8'));

    const startDate = new Date(wildfire.start);
    const endDate = new Date(wildfire.end);
    const metarAirport = wildfire.metarAirport;

    let currentDate = new Date(startDate);
    const allMetars: ParsedMetar[] = [];
    const SIX_HOURS_IN_MS = 6 * 60 * 60 * 1000;
    while (currentDate <= endDate) {
        const startInterval = new Date(currentDate.getTime() - SIX_HOURS_IN_MS); // 6 hours earlier
        let dateString = format(startInterval, "yyyyMMdd_HHmm");
        console.log(dateString);
        const url = `https://aviationweather.gov/api/data/metar?ids=${metarAirport}&hours=6&date=${dateString}`;

        try {
            const response = await axios.get(url);
            const metars = response.data.split('\n').filter(Boolean);
            // Calculate the average number of METARs per hour
            const hoursBetween = (currentDate.getTime() - startInterval.getTime()) / (1000 * 60 * 60);
            const metarsPerHour = metars.length / hoursBetween;

            if (metarsPerHour < 2) {
                console.warn(`Warning: Only ${metarsPerHour.toFixed(2)} METARs per hour on average for ${format(startInterval, "yyyy-MM-dd HH:mm")} to ${format(currentDate, "yyyy-MM-dd HH:mm")}`);
            }

            console.log(`Fetched ${metars.length} METARs`);
            if (metars.length > 0) {
                console.log(`First METAR: ${metars[0]}`);
                console.log(`Last METAR: ${metars[metars.length - 1]}`);
            }

            metars.forEach((metar: string) => {
                const parsed = parseMetar(metar, new Date(new Date(wildfire.start).getTime() - 24 * 60 * 60 * 1000));
                if (parsed) allMetars.push(parsed);
                else {
                    console.warn(`Warning: Failed to parse METAR for ${startInterval.toISOString()} to ${currentDate.toISOString()}:`, metar);
                }
            });
        } catch (error) {
            console.error(`Error fetching metars for ${startInterval.toISOString()} to ${currentDate.toISOString()}:`, error);
        }

        currentDate = new Date(currentDate.getTime() + SIX_HOURS_IN_MS);

        // Wait for 2 seconds before the next request
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const outputPath = path.join('./data', wildfireId, 'metars.json');
    fs.writeFileSync(outputPath, JSON.stringify(allMetars, null, 2));
    let earliestMetar = allMetars.reduce((earliest, current) => earliest.timestamp < current.timestamp ? earliest : current, allMetars[0]);
    let latestMetar = allMetars.reduce((latest, current) => latest.timestamp > current.timestamp ? latest : current, allMetars[0]);


    console.log(`${allMetars.length} metars saved to ${outputPath}`);
    console.log(`Earliest metar: ${new Date(earliestMetar.timestamp * 1000).toISOString()}`);
    console.log(`Latest metar: ${new Date(latestMetar.timestamp * 1000).toISOString()}`);
}
function parseMetar(raw: string, wildfireStartDate: Date): ParsedMetar | null {
    const parts = raw.split(' ');
    if (parts.length < 5) return null; // Reduced minimum parts to 5

    const icaoId = parts[0];
    const timestamp = parts[1].endsWith('Z') ? parts[1].slice(0, -1) : parts[1];
    const day = parseInt(timestamp.slice(0, 2));
    const hour = parseInt(timestamp.slice(2, 4));
    const minute = parseInt(timestamp.slice(4, 6));

    const year = wildfireStartDate.getUTCFullYear();
    const month = wildfireStartDate.getUTCMonth();

    const metarDate = new Date(Date.UTC(year, month, day, hour, minute));

    // If the METAR date is before the wildfire start date, it's from the next month
    if (metarDate < wildfireStartDate) {
        metarDate.setUTCMonth(metarDate.getUTCMonth() + 1);
    }

    const unixTimestamp = Math.floor(metarDate.getTime() / 1000);

    let windIndex = 2;
    let wind: ParsedMetar['wind'] = {
        direction: 0,
        speed: 0,
        variable: false
    };

    if (parts[windIndex] === 'AUTO') windIndex++;

    if (parts[windIndex].includes('KT')) {
        const windPart = parts[windIndex];
        wind.direction = windPart.startsWith('VRB') ? 'VRB' : parseInt(windPart.slice(0, 3));
        wind.speed = parseInt(windPart.slice(3, 5));
        if (windPart.includes('G')) {
            wind.gusting = parseInt(windPart.slice(windPart.indexOf('G') + 1, -2));
        }
        wind.variable = windPart.startsWith('VRB');
    }

    let tempDewIndex = parts.findIndex(p => p.includes('/'));
    let temperature: number | undefined = undefined;
    let dewPoint: number | undefined = undefined;
    if (tempDewIndex !== -1) {
        const tempDewParts = parts[tempDewIndex].split('/');
        temperature = parseInt(tempDewParts[0]);
        dewPoint = parseInt(tempDewParts[1]);
    }

    let qnhIndex = parts.findIndex(p => p.startsWith('Q'));
    let qnh: number | undefined = qnhIndex !== -1 ? parseInt(parts[qnhIndex].slice(1)) : undefined;

    if (temperature === undefined || dewPoint === undefined || qnh === undefined) {
        return null;
    }

    return {
        icaoId,
        raw,
        timestamp: unixTimestamp,
        wind,
        temperature,
        dewPoint,
        qnh
    };
}

// Usage
const wildfireId = process.argv[2];
if (!wildfireId) {
    console.error('Please provide a wildfireId as an argument');
    process.exit(1);
}

getMetars(wildfireId).catch(console.error);
