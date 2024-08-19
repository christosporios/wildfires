import fs from 'fs';
import path from 'path';
import axios from 'axios';

if (process.argv.length < 3) {
    console.error('Please provide a wildfireId as the first argument.');
    process.exit(1);
}

const wildfireId = process.argv[2];
const flightIdsPath = `./data/${wildfireId}/flightIds.txt`;
const outputDir = `./data/${wildfireId}/flights`;

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read flight IDs
const flightIds = fs.readFileSync(flightIdsPath, 'utf-8').split('\n').filter(id => id.trim() !== '');
async function fetchFlightData(flightId: string): Promise<any> {
    const baseUrl = `https://api.flightradar24.com/common/v1/flight-playback.json`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
        'Cache-Control': 'no-cache',
        'DNT': '1',
        'Origin': 'https://www.flightradar24.com',
        'Pragma': 'no-cache',
        'Referer': 'https://www.flightradar24.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site'
    };

    try {
        // First request (expected to fail)
        const initialUrl = `${baseUrl}?flightId=${flightId}`;
        const initialResponse = await axios.get(initialUrl, { headers });

        // Extract timestamp from the failed response
        const timestamp = initialResponse.data.result.response.timestamp;
        // If there's no timestamp, return
        if (!timestamp) {
            console.warn(`No timestamp available for flight ${flightId}. Skipping.`);
            return null;
        }

        // Second request with timestamp
        const finalUrl = `${baseUrl}?flightId=${flightId}&timestamp=${timestamp}`;
        const finalResponse = await axios.get(finalUrl, { headers });

        const flightData = finalResponse.data.result.response;
        const outputPath = path.join(outputDir, `${flightId}.json`);

        if (!flightData.data.flight.track || flightData.data.flight.track.length === 0) {
            console.warn(`Warning: No track data available for flight ${flightId}`);
        }

        fs.writeFileSync(outputPath, JSON.stringify(flightData, null, 2));
        return flightData;
    } catch (error) {
        console.error(`Error fetching data for flight ${flightId}:`, error);
        return null;
    }
}

async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Read wildfire data
const wildfireData = JSON.parse(fs.readFileSync(`data/${wildfireId}/wildfire.json`, 'utf8'));
const fireStart = new Date(wildfireData.start);
const fireEnd = new Date(wildfireData.end);

// Calculate 24 hours before fire start and 24 hours after fire end
const trackStartLimit = new Date(fireStart.getTime() - 24 * 60 * 60 * 1000);
const trackEndLimit = new Date(fireEnd.getTime() + 24 * 60 * 60 * 1000);

async function processFlights(): Promise<void> {
    const totalFlights = flightIds.length;
    let processedFlights = 0;
    const startTime = Date.now();
    const allFlightData: { [key: string]: any } = {};
    let trackTrails = 0;
    let flightsSkipped = 0;

    for (const flightId of flightIds) {
        const flightData = await fetchFlightData(flightId);
        if (!flightData) {
            flightsSkipped++;
        } else {
            allFlightData[flightId] = flightData;

            trackTrails += flightData.data.flight.track.length;
            // Check track times
            const track = flightData.data.flight.track;
            if (track && track.length > 0) {
                const firstTrackTime = new Date(track[0].timestamp * 1000);
                const lastTrackTime = new Date(track[track.length - 1].timestamp * 1000);

                if (firstTrackTime < trackStartLimit) {
                    console.warn(`Warning: Flight ${flightId} has track data before 24 hours of fire start.`);
                }

                if (lastTrackTime > trackEndLimit) {
                    console.warn(`Warning: Flight ${flightId} has track data after 24 hours of fire end.`);
                }
            }

            processedFlights++;
        }

        // Calculate and print progress
        const progress = (processedFlights / totalFlights) * 100;
        if (progress % 2 < (processedFlights - 1) / totalFlights * 100 % 2) {
            const elapsedTime = (Date.now() - startTime) / 1000;
            const estimatedTotalTime = (elapsedTime / processedFlights) * totalFlights;
            const eta = estimatedTotalTime - elapsedTime;
            console.log(`Progress: ${progress.toFixed(0)}%, ETA: ${eta.toFixed(0)} seconds, skipped: ${flightsSkipped}, processed: ${processedFlights}, trails: ${trackTrails}`);
        }

        // Random pause between 1 and 10 seconds
        await sleep(Math.random() * 10000 + 1000);
    }

    // Write all flight data to all.json
    const allFlightDataPath = path.join(outputDir, 'all.json');
    fs.writeFileSync(allFlightDataPath, JSON.stringify(allFlightData, null, 2));
    console.log(`Total track trails: ${trackTrails}`);
    console.log(`All flight data written to ${allFlightDataPath}`);
}

processFlights().then(() => console.log('All flights processed'));
