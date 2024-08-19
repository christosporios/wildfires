import React from 'react';
import { ParsedMetar } from '../lib/types';
import { Weather as WeatherType } from '../lib/types';
import { Card, CardContent } from "@/components/ui/card";
import { usePageSettings } from '../contexts/SettingsContext';

interface WeatherProps {
    metars: ParsedMetar[];
    zuluTime: Date;
}

const Weather: React.FC<WeatherProps> = ({ metars, zuluTime }) => {
    const { settings } = usePageSettings();
    const currentMetar = metars
        .filter(metar => metar.timestamp <= Math.floor(zuluTime.getTime() / 1000))
        .sort((a, b) => b.timestamp - a.timestamp)[0];
    const weather = currentMetar ? new WeatherType(currentMetar) : undefined;

    if (!weather) {
        return null;
    }

    const rotationStyle = {
        transform: `rotate(${weather.windDirection === 'VRB' ? 0 : (weather.windDirection + 180) % 360}deg)`,
    };

    if (settings.watchMode) {
        return (
            <div className="fixed top-4 right-4 z-[1000]">
                <WindIcon knots={weather.windSpeed} className="w-24 h-24" style={rotationStyle} />
            </div>
        );
    }

    const formatWindSpeed = (speed: number, gusts?: number): string => {
        switch (settings.units.windSpeed) {
            case 'knots':
                return `${speed}${gusts ? ` - ${gusts}` : ''} kt`;
            case 'beaufort':
                const beaufortSpeed = convertToBeaufort(speed);
                const beaufortGusts = gusts ? convertToBeaufort(gusts) : undefined;
                return `B${beaufortSpeed}${beaufortGusts !== undefined ? `-${beaufortGusts}` : ''}`;
            case 'kmh':
                const kmhSpeed = Math.round(speed * 1.852);
                const kmhGusts = gusts ? Math.round(gusts * 1.852) : undefined;
                return `${kmhSpeed}${kmhGusts !== undefined ? `-${kmhGusts}` : ''} km/h`;
            default:
                return `${speed}${gusts ? `-${gusts}` : ''}`;
        }
    };

    const formatTemperature = (temp: number): string => {
        if (settings.units.temperature === 'fahrenheit') {
            return `${Math.round((temp * 9 / 5) + 32)}°F`;
        }
        return `${temp}°C`;
    };

    return (
        <Card className="">
            <CardContent className="p-4 flex flex-col h-full gap-1 w-36">
                <div className='font-mono text-xs text-center'>
                    {currentMetar ? `${currentMetar.icaoId} ${new Date(currentMetar.timestamp * 1000).toUTCString().slice(17, 22)}Z` : '-'}
                </div>
                <div className="flex flex-row justify-evenly gap-2 w-full">
                    <div className="flex flex-col items-center justify-between">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <WindIcon knots={weather.windSpeed} className="w-6 h-6" style={rotationStyle} />
                        </div>
                        <div className="text-xs text-center mt-2 text-muted-foreground">
                            {formatWindSpeed(weather.windSpeed, weather.windGusting)}
                        </div>
                    </div>
                    <div className="flex flex-col justify-between items-end">
                        <div className="text-lg flex items-center h-16">{formatTemperature(weather.temperature)}</div>
                        <div className="text-xs text-muted-foreground">{weather.humidity}%</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

const WindIcon: React.FC<{ knots: number; className?: string; style?: React.CSSProperties }> = ({ knots, className, style }) => {
    let iconPath;
    if (knots < 5) {
        // Circle with a dot in the center (calm)
        iconPath = "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z";
    } else {
        iconPath = "M12 22L12 0M8 8"; // base arrow

        // Calculate the number of barbs (capped at 4)
        const barbs = Math.min(Math.floor(knots / 10), 4);
        // Add barbs
        for (let i = 0; i < barbs; i++) {
            iconPath += `M12 ${22 - i * 4}L20 ${22 - i * 4}`;
        }

        const halfBarb = knots % 5 > 0;
        if (halfBarb) {
            iconPath += `M12 ${22 - barbs * 4}L16 ${22 - barbs * 4}`;
        }
    }


    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${className} w-8 h-8`} // Increased size
            style={{ ...style, width: '2rem', height: '2rem' }} // Explicit size in rem
        >
            <path d={iconPath} />
        </svg>
    );
};

// Add this function to convert knots to Beaufort scale
function convertToBeaufort(knots: number): number {
    const beaufortScale = [1, 3, 6, 10, 16, 21, 27, 33, 40, 47, 55, 63];
    return beaufortScale.findIndex(limit => knots < limit);
}

export default Weather;