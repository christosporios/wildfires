export interface WildfireData {
    metars: ParsedMetar[];
    flights: { [flightId: string]: Flight };
    wildfire: Wildfire;
    fires: {
        viirs: Fire[];
        modis: Fire[];
    };
}

export interface ParsedMetar {
    icaoId: string;
    raw: string;
    timestamp: number;
    wind: {
        direction: number | 'VRB';
        speed: number;
        gusting?: number;
        variable: boolean;
    };
    temperature: number;
    dewPoint: number;
    qnh: number;
}

export class Weather {
    public windSpeed: number;
    public windDirection: number | 'VRB';
    public windGusting?: number;
    public temperature: number;
    public humidity: number;

    constructor(metar: ParsedMetar) {
        this.windSpeed = metar.wind.speed;
        this.windDirection = metar.wind.direction;
        this.windGusting = metar.wind.gusting;
        this.temperature = metar.temperature;
        this.humidity = this.calculateHumidity(metar.temperature, metar.dewPoint);
    }

    private calculateHumidity(temperature: number, dewPoint: number): number {
        // Magnus formula for relative humidity
        const a = 17.27;
        const b = 237.7;

        const alphaDewPoint = (a * dewPoint) / (b + dewPoint);
        const alphaTemperature = (a * temperature) / (b + temperature);

        const relativeHumidity = 100 * Math.exp(alphaDewPoint - alphaTemperature);
        return Math.round(relativeHumidity);
    }
}

export type Flight = {
    timestamp: number;
    altitudeFiltered: boolean;
    data: {
        flight: {
            identification: {
                id: string;
                number: {
                    default: null;
                };
                callsign: string;
            };
            status: {
                live: boolean;
                text: string;
                icon: string;
                estimated: null;
                ambiguous: boolean;
                generic: {
                    status: {
                        text: string;
                        type: string;
                        color: string;
                        diverted: null;
                    };
                    eventTime: {
                        utc: number;
                        local: null;
                    };
                };
            };
            aircraft: {
                model: {
                    code: string;
                    text: string;
                };
                identification: {
                    modes: string;
                    registration: string;
                    serialNo: null;
                    age: {
                        availability: boolean;
                    };
                };
                availability: {
                    serialNo: boolean;
                    age: boolean;
                };
            };
            owner: null;
            airline: null;
            airport: {
                origin: null;
                destination: null;
                real: null;
            };
            median: {
                time: null;
                delay: null;
                timestamp: null;
            };
            track: Array<{
                latitude: number;
                longitude: number;
                altitude: {
                    feet: number;
                    meters: number;
                };
                speed: {
                    kmh: number;
                    kts: number;
                    mph: number;
                };
                verticalSpeed: {
                    fpm: number;
                    ms: number;
                };
                heading: number;
                squawk: string;
                timestamp: number;
                ems: null;
            }>;
            aircraftImages: {
                thumbnails: Array<ImageInfo>;
                medium: Array<ImageInfo>;
                large: Array<ImageInfo>;
            };
            availability: {
                ems: boolean;
            };
        };
    };
};

type ImageInfo = {
    src: string;
    link: string;
    copyright: string;
    source: string;
};

export type WindSpeedUnit = 'knots' | 'beaufort' | 'kmh';
export type AircraftSpeedUnit = 'knots' | 'kmh';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type LengthUnit = 'meters' | 'feet';
export type Theme = 'day-night' | 'dark' | 'light';

export type Wildfire = {
    id: string;
    year: number;
    boundingBox: [[number, number], [number, number]];
    position: [number, number];
    zoom: number;
    start: string;
    end: string;
    timezone: string;
    metarAirport: string;
};

export type ThermalAnomaly = {
    latitude: number;
    longitude: number;
    acq_date: string;
    acq_time: string;
    version: string;
    bright_t31: number;
    daynight: "D" | "N";
    brightness: number;
    confidence: string | number;
    instrument: "VIIRS" | "MODIS";
    track: number;
    satellite: string;
    scan: number;
    frp: number;
};

export interface Fire {
    position: [number, number];
    timestamp: number;
    instrument: string;
    satellite: string;
    brightness: number;
}