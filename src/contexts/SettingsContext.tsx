import React, { createContext, useContext, useState, useEffect } from 'react';
import { WindSpeedUnit, TemperatureUnit, LengthUnit, Theme } from '../lib/types';
import { useTheme } from "next-themes"
import { getSunrise, getSunset } from "sunrise-sunset-js";


interface PageSettings {
    watchMode: boolean;
    showAircraftTrails: boolean;
    theme: Theme;
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

export function SettingsProvider({ children, currentTime, location }: { children: React.ReactNode, currentTime: Date, location: [number, number] }) {
    const { setTheme } = useTheme();
    const [settings, setSettings] = useState<PageSettings>({
        watchMode: false,
        showAircraftTrails: true,
        theme: 'day-night',
        units: {
            windSpeed: 'knots',
            temperature: 'celsius',
            altitude: 'meters',
            height: 'meters',
        },
        dataLayers: {
            fires: true,
            flights: true,
            evacuationOrders: true,
            weather: true,
            waterDrops: true,
        },
    });

    useEffect(() => {
        const updateTheme = () => {
            setTheme(isDarkMode() ? 'dark' : 'light');
        };

        updateTheme();
    }, [settings.theme, currentTime, setTheme]);


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

        let sunrise = getSunrise(location[0], location[1], currentTime);
        let sunset = getSunset(location[0], location[1], currentTime);
        return currentTime <= sunrise || currentTime >= sunset;
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