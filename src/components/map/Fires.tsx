import React, { useState } from 'react';
import { Fire as FireType } from '../../lib/types';
import { LatLngTuple } from 'leaflet';
import { Circle } from 'react-leaflet';
import { usePageSettings } from '@/contexts/SettingsContext';

interface FiresProps {
    fires: FireType[];
    zuluTime: Date;
}

const Fires: React.FC<FiresProps> = ({ fires, zuluTime }: FiresProps) => {
    let { settings } = usePageSettings();

    let selectedFires: FireType[] = [];
    if (settings.fireSource == 'MODIS and VIIRS') {
        selectedFires = fires;
    } else if (settings.fireSource == 'VIIRS only') {
        selectedFires = fires.filter((f) => f.instrument === "VIIRS")
    } else if (settings.fireSource == 'MODIS only') {
        selectedFires = fires.filter((f) => f.instrument === "MODIS")
    }

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
                />
            ))}
        </>
    );
};

function Fire({ fire, fadePercent }: { fire: FireType, fadePercent: number }) {
    const radius = 50;
    return (
        <Circle
            center={fire.position as LatLngTuple}
            radius={radius}
            pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 - fadePercent, opacity: 1 - fadePercent }}
        />
    );
}

export default Fires;
