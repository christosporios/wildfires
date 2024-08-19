import fs from 'fs';
import path from 'path';
import { ThermalAnomaly } from '../src/lib/types';
import { Fire } from '../src/lib/types';

async function getFires(wildfireId: string): Promise<void> {
    const inputDir = path.join('./data', wildfireId, 'inputs');
    const outputPath = path.join('./data', wildfireId, 'fires.json');

    const fires: { viirs: Fire[], modis: Fire[] } = { viirs: [], modis: [] };

    // Read all JSON files in the input directory
    const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.json'));

    for (const file of files) {
        const filePath = path.join(inputDir, file);
        const data: ThermalAnomaly[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        data.forEach(anomaly => {
            const fire: Fire = {
                position: [anomaly.latitude, anomaly.longitude],
                timestamp: getTimestamp(anomaly.acq_date, anomaly.acq_time),
                instrument: anomaly.instrument,
                satellite: anomaly.satellite,
                brightness: anomaly.brightness
            };

            if (anomaly.instrument === 'VIIRS') {
                fires.viirs.push(fire);
            } else if (anomaly.instrument === 'MODIS') {
                fires.modis.push(fire);
            } else {
                console.warn(`Unknown instrument: ${anomaly.instrument}`);
            }
        });
    }

    // Sort fires by timestamp
    fires.viirs.sort((a, b) => a.timestamp - b.timestamp);
    fires.modis.sort((a, b) => a.timestamp - b.timestamp);

    // Write the processed data to fires.json
    fs.writeFileSync(outputPath, JSON.stringify(fires, null, 2));
    console.log(`Processed fires saved to ${outputPath}`);
    console.log(`Total VIIRS fires: ${fires.viirs.length}`);
    console.log(`Total MODIS fires: ${fires.modis.length}`);
}

function getTimestamp(date: string, time: string): number {
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.padStart(4, '0').split(/(.{2})/).filter(Boolean).map(Number);
    return Math.floor(new Date(year, month - 1, day, hour, minute).getTime() / 1000);
}

// Usage
const wildfireId = process.argv[2];
if (!wildfireId) {
    console.error('Please provide a wildfireId as an argument');
    process.exit(1);
}

getFires(wildfireId).catch(console.error);
