import { MapContainer, TileLayer } from 'react-leaflet'
import { LatLngTuple } from 'leaflet';
import { useState, useEffect } from 'react';
import { usePageSettings } from '../contexts/SettingsContext';

interface MapComponentProps {
    position: LatLngTuple;
    children: React.ReactNode;
    zoom: number;
}

export default function MapComponent({ position, children, zoom }: MapComponentProps) {
    const [showAttribution, setShowAttribution] = useState(true);
    const { isDarkMode, settings } = usePageSettings();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAttribution(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <MapContainer center={position} zoom={zoom} scrollWheelZoom={true} zoomControl={false} style={{ height: '100%', width: '100%' }}>
            {settings.showSatelliteMap ? (
                <TileLayer
                    attribution={showAttribution ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' : ''}
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
            ) : (
                <TileLayer
                    attribution={showAttribution ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' : ''}
                    url={isDarkMode()
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                />
            )}
            {children}
        </MapContainer>
    )
}