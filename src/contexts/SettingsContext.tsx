import React, { createContext, useContext, useState, useEffect } from 'react';
import { WindSpeedUnit, TemperatureUnit, LengthUnit, Theme, AircraftSpeedUnit } from '../lib/types';
import { useTheme } from "next-themes"
import { getSunrise, getSunset } from "sunrise-sunset-js";
import { toZonedTime } from 'date-fns-tz';


export interface PageSettings {
    watchMode: boolean;
    showAircraftTrails: boolean;
    showSatelliteMap: boolean;
    interpolateAircraftPositions: boolean;
    theme: Theme;
    fireSource: 'MODIS and VIIRS' | 'VIIRS only' | 'MODIS only';
    fireFadeTime: number;
    units: {
        aircraftSpeed: AircraftSpeedUnit;
        windSpeed: WindSpeedUnit;
        temperature: TemperatureUnit;
        altitude: LengthUnit;
        height: LengthUnit;
    };
    dataLayers: {
        fires: boolean;
        flights: boolean;
        evacuationOrders: boolean;
        weather: boolean;
        waterDrops: boolean;
    };
}

interface SettingsContextType {
    settings: PageSettings;
    updateSettings: (newSettings: Partial<PageSettings>) => void;
    isDarkMode: () => boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children, zuluTime, location, timezone }: { children: React.ReactNode, zuluTime: Date, location: [number, number], timezone: string }) {
    const { setTheme } = useTheme();
    const [settings, setSettings] = useState<PageSettings>({
        watchMode: false,
        showAircraftTrails: true,
        showSatelliteMap: false,
        interpolateAircraftPositions: true,
        fireSource: 'MODIS and VIIRS',
        theme: 'day-night',
        fireFadeTime: 24 * 60 * 60 * 1000,
        units: {
            windSpeed: 'knots',
            temperature: 'celsius',
            altitude: 'meters',
            height: 'meters',
            aircraftSpeed: 'knots',
        },
        dataLayers: {
            fires: true,
            flights: true,
            evacuationOrders: false,
            weather: true,
            waterDrops: false,
        },
    });

    useEffect(() => {
        const updateTheme = () => {
            setTheme(isDarkMode() ? 'dark' : 'light');
        };

        updateTheme();
    }, [settings.theme, zuluTime, setTheme]);


    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'w') {
                setSettings(prev => ({ ...prev, watchMode: !prev.watchMode }));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const updateSettings = (newSettings: Partial<PageSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const isDarkMode = () => {
        if (settings.theme === 'dark') return true;
        if (settings.theme === 'light') return false;

        let localTime = toZonedTime(zuluTime, timezone);

        let sunrise = getSunrise(location[0], location[1], localTime);
        let sunset = getSunset(location[0], location[1], localTime);

        return localTime <= sunrise || localTime >= sunset;
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isDarkMode }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function usePageSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('usePageSettings must be used within a SettingsProvider');
    }
    return context;
}