import { MapContainer, TileLayer } from 'react-leaflet'
import { LatLngTuple } from 'leaflet';
import { useState, useEffect } from 'react';
import { usePageSettings } from '../contexts/SettingsContext';

interface MapComponentProps {
    position: LatLngTuple;
    children: React.ReactNode;
}

export default function MapComponent({ position, children }: MapComponentProps) {
    const [showAttribution, setShowAttribution] = useState(true);
    const { isDarkMode } = usePageSettings();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAttribution(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <MapContainer center={position} zoom={10} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution={showAttribution ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' : ''}
                url={isDarkMode()
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
            />
            {children}
        </MapContainer>
    )
}