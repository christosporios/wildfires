
export type DataSourceData = {
    period: { from: Date, to: Date };
    data: TimedEvent[];
    meta: any;
}

export type Wildfire = {
    id: string;
    name: string;
    boundingBox: [Coordinates, Coordinates];
    position: [number, number];
    zoom: number;
    start: string;
    end?: string; // undefined for live wildfires
    timezone: string;
    metarAirport: string;
    dataSources: string[];
};

export interface WildfireData {
    wildfire: Wildfire;
    events: TimedEvent[];
    recency: { [key: string]: { from: Date | null, to: Date | null } }
}

export interface WildfireSummary {
    fires: Fire[];
    wildfire: Wildfire;
}

/* events */

export interface TimedEvent {
    timestamp: number;
    event: "flightPing" | "metar" | "fire" | "announcement";
}

export interface FlightPing extends TimedEvent {
    event: "flightPing"
    callsign: string;
    icao24: string;
    position: Coordinates;
    altitude: number;
    altitudeGeometric: number;
    velocity: number;
    verticalSpeed: number;
    heading: number;
    squawk: string;
    timestamp: number;
}

export interface Metar extends TimedEvent {
    event: "metar";
    type: string;
    icaoId: string;
    raw: string;
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

export interface Fire extends TimedEvent {
    event: "fire";
    position: Coordinates;
    timestamp: number;
    instrument: string;
    satellite: string;
    brightness?: number;
}

export interface Announcement extends TimedEvent {
    event: "announcement";
    tweetUrl: string;
    type: "alert" | "evacuate";
    timestamp: number;

    from: {
        name: string;
        position: Coordinates;
    }[];

    to: {
        name: string
        position: Coordinates
    }[];
}


// [Latitude, Longitude]
export type Coordinates = [number, number];

export type WindSpeedUnit = 'knots' | 'beaufort' | 'kmh';
export type AircraftSpeedUnit = 'knots' | 'kmh';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type LengthUnit = 'meters' | 'feet';
export type Theme = 'day-night' | 'dark' | 'light';

export type PopupEvent = {
    timestamp: number;
    type: string;
    description: string;
}

export class Weather {
    public windSpeed: number;
    public windDirection: number | 'VRB';
    public windGusting?: number;
    public temperature: number;
    public humidity: number;

    constructor(metar: Metar) {
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