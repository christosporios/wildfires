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
    showEvents: boolean;
    eventFadeTimeMs: number;
    announcementsFadeTime: number;
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

const defaultSettings: PageSettings = {
    watchMode: false,
    showAircraftTrails: true,
    showSatelliteMap: false,
    interpolateAircraftPositions: true,
    fireSource: 'MODIS and VIIRS',
    theme: 'day-night',
    fireFadeTime: 24 * 60 * 60 * 1000,
    announcementsFadeTime: 3 * 60 * 60 * 1000,
    showEvents: true,
    eventFadeTimeMs: 1 * 60 * 60 * 1000,
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
        evacuationOrders: true,
        weather: true,
        waterDrops: false,
    },
};

function useSettingsProvider(initialSettings: PageSettings) {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<PageSettings>(initialSettings);

    const updateSettings = (newSettings: Partial<PageSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const isDarkMode = () => {
        if (settings.theme === 'dark') return true;
        if (settings.theme === 'light') return false;

        return theme === 'dark';
    };

    useEffect(() => {
        if (setTheme) {
            setTheme(isDarkMode() ? 'dark' : 'light');
        }
    }, [settings.theme, setTheme]);

    return { settings, updateSettings, isDarkMode };
}

export function BaseSettingsProvider({ children }: { children: React.ReactNode }) {
    const { settings, updateSettings, isDarkMode } = useSettingsProvider(defaultSettings);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isDarkMode }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function LocalizedSettingsProvider({ children, zuluTime, location, timezone }: { children: React.ReactNode, zuluTime: Date, location: [number, number], timezone: string }) {
    const { theme, setTheme } = useTheme();
    const [settings, setSettings] = useState<PageSettings>(defaultSettings);

    const updateSettings = (newSettings: Partial<PageSettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === 'w') {
                updateSettings({ watchMode: !settings.watchMode });
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [settings.watchMode]);

    const localizedIsDarkMode = () => {
        if (settings.theme === 'dark') return true;
        if (settings.theme === 'light') return false;

        let localTime = toZonedTime(zuluTime, timezone);
        let sunrise = getSunrise(location[0], location[1], localTime);
        let sunset = getSunset(location[0], location[1], localTime);

        return localTime <= sunrise || localTime >= sunset;
    };

    useEffect(() => {
        const updateTheme = () => {
            const isDark = localizedIsDarkMode();
            setTheme(isDark ? 'dark' : 'light');
        };

        updateTheme();

        // Set up an interval to check and update the theme every minute
        const intervalId = setInterval(updateTheme, 60000);

        return () => clearInterval(intervalId);
    }, [zuluTime, location, timezone, settings.theme, setTheme]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isDarkMode: localizedIsDarkMode }}>
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