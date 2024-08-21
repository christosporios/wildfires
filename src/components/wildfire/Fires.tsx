import React, { useState } from 'react';
import { Fire as FireType } from '../../lib/types';
import { LatLngTuple } from 'leaflet';
import { Circle } from 'react-leaflet';
import { usePageSettings } from '@/contexts/SettingsContext';

interface FiresProps {
    fires: {
        viirs: FireType[];
        modis: FireType[];
    };
    zuluTime: Date;
}

const Fires: React.FC<FiresProps> = ({ fires, zuluTime }: FiresProps) => {
    let { settings } = usePageSettings();

    let selectedFires: FireType[] = [];
    if (settings.fireSource == 'MODIS and VIIRS') {
        selectedFires = fires.viirs.concat(fires.modis);
    } else if (settings.fireSource == 'VIIRS only') {
        selectedFires = fires.viirs;
    } else if (settings.fireSource == 'MODIS only') {
        selectedFires = fires.modis;
    }

    let [lowestBrightness, setLowestBrightness] = useState(() => {
        return Math.min(...selectedFires.map(fire => fire.brightness));
    });
    let [highestBrightness, setHighestBrightness] = useState(() => {
        return Math.max(...selectedFires.map(fire => fire.brightness));
    });

    const fadeTime = settings.fireFadeTime;

    let activeFires = selectedFires.filter(fire => {
        const fireTime = new Date(fire.timestamp * 1000);
        const timeDiff = zuluTime.getTime() - fireTime.getTime();
        return fireTime <= zuluTime && timeDiff <= fadeTime;
    });

    return (
        <>
            {activeFires.map((fire) => (
                <Fire
                    key={`${fire.timestamp}-${fire.position.join(',')}`}
                    fire={fire}
                    fadePercent={(zuluTime.getTime() - fire.timestamp * 1000) / fadeTime}
                    brightnessPercent={(fire.brightness - lowestBrightness) / (highestBrightness - lowestBrightness)}
                />
            ))}
        </>
    );
};

function Fire({ fire, fadePercent, brightnessPercent }: { fire: FireType, fadePercent: number, brightnessPercent: number }) {
    const minRadius = 10;
    const maxRadius = 100;
    const radius = minRadius + (maxRadius - minRadius) * brightnessPercent;
    return (
        <Circle
            center={fire.position as LatLngTuple}
            radius={radius}
            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 - fadePercent, opacity: 1 - fadePercent }}
        />
    );
}

export default Fires;
