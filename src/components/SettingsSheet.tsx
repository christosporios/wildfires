import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Menu, ChevronsUpDown } from "lucide-react";
import { usePageSettings } from '../contexts/SettingsContext';
import { WindSpeedUnit, TemperatureUnit, LengthUnit, Theme } from '../lib/types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const KeyboardShortcut = ({ action, shortcut }: { action: string; shortcut: string }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm">{action}</span>
        <kbd className="min-w-[2rem] px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg text-center">{shortcut}</kbd>
    </div>
);

const Setting = ({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between">
        <div>
            <label className="text-sm font-medium leading-none">{label}</label>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {children}
    </div>
);

const CollapsibleSection = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
            <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                        <ChevronsUpDown className="h-4 w-4" />
                        <span className="sr-only">Toggle</span>
                    </Button>
                </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2">
                {children}
            </CollapsibleContent>
        </Collapsible>
    );
};

export function SettingsSheet() {
    const { settings, updateSettings } = usePageSettings();

    const handleDataLayerChange = (key: keyof typeof settings.dataLayers) => (checked: boolean) => {
        updateSettings({ dataLayers: { ...settings.dataLayers, [key]: checked } });
    };

    const handleUnitChange = (key: keyof typeof settings.units) => (value: WindSpeedUnit | TemperatureUnit | LengthUnit) => {
        updateSettings({ units: { ...settings.units, [key]: value } });
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="fixed top-4 left-4 z-[1000] ">
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="z-[1000] overflow-y-auto flex flex-col h-full">
                <SheetHeader>
                    <SheetTitle>Page Settings</SheetTitle>
                </SheetHeader>
                <div className="grid gap-8 py-4 overflow-y-auto">
                    <CollapsibleSection title="Data" defaultOpen={true}>
                        <Setting label="Fires" description="NASA FIRMS">
                            <Switch
                                id="fires"
                                checked={settings.dataLayers.fires}
                                onCheckedChange={handleDataLayerChange('fires')}
                            />
                        </Setting>
                        <Setting label="Flights" description="Flightradar24 (scraped)">
                            <Switch
                                id="flights"
                                checked={settings.dataLayers.flights}
                                onCheckedChange={handleDataLayerChange('flights')}
                            />
                        </Setting>
                        <Setting label="Evacuation Orders" description="112 (twitter)">
                            <Switch
                                id="evacuation"
                                checked={settings.dataLayers.evacuationOrders}
                                onCheckedChange={handleDataLayerChange('evacuationOrders')}
                            />
                        </Setting>
                        <Setting label="Weather" description="LGAV Metar">
                            <Switch
                                id="weather"
                                checked={settings.dataLayers.weather}
                                onCheckedChange={handleDataLayerChange('weather')}
                            />
                        </Setting>
                        <Setting label="Water Drops" description="Derived">
                            <Switch
                                id="water-drops"
                                checked={settings.dataLayers.waterDrops}
                                onCheckedChange={handleDataLayerChange('waterDrops')}
                            />
                        </Setting>
                    </CollapsibleSection>
                    <CollapsibleSection title="Options">
                        <Setting label="Watch Mode">
                            <Switch
                                id="watch-mode"
                                checked={settings.watchMode}
                                onCheckedChange={(checked) => updateSettings({ watchMode: checked })}
                            />
                        </Setting>
                        <Setting label="Show Aircraft Trails">
                            <Switch
                                id="aircraft-trails"
                                checked={settings.showAircraftTrails}
                                onCheckedChange={(checked) => updateSettings({ showAircraftTrails: checked })}
                            />
                        </Setting>
                        <Setting label="Theme">
                            <Select
                                value={settings.theme}
                                onValueChange={(value: Theme) => updateSettings({ theme: value })}
                            >
                                <SelectTrigger id="theme" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="day-night">Day/Night</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                    </CollapsibleSection>
                    <CollapsibleSection title="Units">
                        <Setting label="Wind Speed">
                            <Select
                                value={settings.units.windSpeed}
                                onValueChange={handleUnitChange('windSpeed')}
                            >
                                <SelectTrigger id="wind-speed-unit" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="knots">Knots</SelectItem>
                                    <SelectItem value="beaufort">Beaufort</SelectItem>
                                    <SelectItem value="kmh">km/h</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                        <Setting label="Temperature">
                            <Select
                                value={settings.units.temperature}
                                onValueChange={handleUnitChange('temperature')}
                            >
                                <SelectTrigger id="temperature-unit" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="celsius">°C</SelectItem>
                                    <SelectItem value="fahrenheit">°F</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                        <Setting label="Altitude">
                            <Select
                                value={settings.units.altitude}
                                onValueChange={handleUnitChange('altitude')}
                            >
                                <SelectTrigger id="altitude-unit" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="meters">m</SelectItem>
                                    <SelectItem value="feet">ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                        <Setting label="Height">
                            <Select
                                value={settings.units.height}
                                onValueChange={handleUnitChange('height')}
                            >
                                <SelectTrigger id="height-unit" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="meters">m</SelectItem>
                                    <SelectItem value="feet">ft</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                        <Setting label="Aircraft Speed">
                            <Select
                                value={settings.units.aircraftSpeed}
                                onValueChange={handleUnitChange('aircraftSpeed')}
                            >
                                <SelectTrigger id="aircraft-speed-unit" className="w-[120px] ml-auto">
                                    <SelectValue placeholder="Select unit" />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    <SelectItem value="knots">Knots</SelectItem>
                                    <SelectItem value="kmh">km/h</SelectItem>
                                </SelectContent>
                            </Select>
                        </Setting>
                    </CollapsibleSection>
                    <CollapsibleSection title="Keyboard Shortcuts">
                        <KeyboardShortcut action="Watch mode" shortcut="W" />
                        <KeyboardShortcut action="Play/pause" shortcut="Space" />
                        <KeyboardShortcut action="Increase speed" shortcut="Q" />
                        <KeyboardShortcut action="Decrease speed" shortcut="A" />
                    </CollapsibleSection>
                </div>
                <footer className="mt-auto pt-4 text-center text-xs text-muted-foreground">
                    <p>Don't use this for anything important.</p>
                    <p><a href="https://twitter.com/christosporios" target="_blank" rel="noopener noreferrer" className="underline">@christosporios</a></p>
                </footer>
            </SheetContent>
        </Sheet>
    );
}
