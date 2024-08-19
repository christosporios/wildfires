import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { format, addMinutes, differenceInMinutes, startOfDay, isSameDay, isEqual, addDays, addHours, endOfDay } from 'date-fns';
import { PauseIcon, PlayIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineProps {
    startDate: Date;
    endDate: Date;
}
import { usePageSettings } from '../contexts/SettingsContext';

export default function Timeline({ startDate, endDate, tick }: TimelineProps & { tick: (time: Date) => void }) {
    const [currentTime, setCurrentTime] = useState(startDate);
    const [isPlaying, setIsPlaying] = useState(false);
    const availableSpeeds = [1, 4, 16, 64, 256, 1024, 4096];
    const totalSeconds = differenceInMinutes(endDate, startDate) * 60;
    const [speed, setSpeed] = useState(() => {
        // Find the speed that will give a total play time of 150 seconds
        return availableSpeeds.reduce((prev, curr) =>
            Math.abs(curr - totalSeconds / 150) < Math.abs(prev - totalSeconds / 150) ? curr : prev
        );
    });
    const totalMinutes = differenceInMinutes(endDate, startDate);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { settings } = usePageSettings();

    const playPause = () => {
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                playPause();
            }
            if (event.code === 'KeyQ') {
                event.preventDefault();
                const currentIndex = availableSpeeds.indexOf(speed);
                console.log(`Current speed is ${speed}, current index is ${currentIndex}`);
                if (currentIndex < availableSpeeds.length - 1) {
                    setSpeed(availableSpeeds[currentIndex + 1]);
                }
            }
            if (event.code === 'KeyA') {
                event.preventDefault();
                const currentIndex = availableSpeeds.indexOf(speed);
                console.log(`Current speed is ${speed}, current index is ${currentIndex}`);
                if (currentIndex > 0) {
                    setSpeed(availableSpeeds[currentIndex - 1]);
                }
            }
            console.log(`Available speeds: ${availableSpeeds}`);
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [isPlaying, availableSpeeds]);

    const updateTime = (newTime: Date) => {
        setCurrentTime(newTime);
        tick(newTime);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(() => {
                setCurrentTime((prevTime) => {
                    const newTime = addMinutes(prevTime, speed / 600);
                    if (newTime > endDate) {
                        clearInterval(intervalRef.current!);
                        setIsPlaying(false);
                        return endDate;
                    }
                    return newTime;
                });
            }, 100);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, speed, endDate]);

    useEffect(() => {
        tick(currentTime);
    }, [currentTime, tick]);

    if (settings.watchMode) {
        return (
            <div className="fixed bottom-4 left-4 z-[1000] font-mono text-sm sm:text-base md:text-lg">
                {format(currentTime, 'HH:mm:ss EEEE, MMMM d')}
            </div>
        );
    }

    return (
        <Card className="m-2 sm:m-4">
            <CardContent className="p-2 sm:p-6">
                <div className="flex flex-col space-y-4">
                    <div className="flex justify-evenly items-center">
                        <div className="flex items-center space-x-4">
                            <Button onClick={playPause} className="" variant={isPlaying ? 'outline' : 'default'}>
                                {isPlaying ? <PauseIcon className="w-full h-full" /> : <PlayIcon className="w-full h-full" />}
                            </Button>

                            <Select value={speed.toString()} onValueChange={(value) => setSpeed(Number(value))}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder={`Playback speed`} />
                                </SelectTrigger>
                                <SelectContent className="z-[1000]">
                                    {availableSpeeds.map((s) => (
                                        <SelectItem key={s} value={s.toString()}>
                                            {s}x
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="text-center text-sm sm:text-base md:text-lg flex-grow font-mono">
                            {format(currentTime, 'HH:mm:ss EEEE, MMMM d')}
                        </div>

                        <div className="min-w-[1rem]">
                        </div>
                    </div>

                    <TimelineSlider
                        startDate={startDate}
                        endDate={endDate}
                        currentTime={currentTime}
                        updateTime={updateTime}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

interface TimelineSliderProps {
    startDate: Date;
    endDate: Date;
    currentTime: Date;
    updateTime: (time: Date) => void;
}

function TimelineSlider({ startDate, endDate, currentTime, updateTime }: TimelineSliderProps) {
    const totalMinutes = differenceInMinutes(endDate, startDate);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        updateSlider(e.clientX);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true);
        updateSlider(e.touches[0].clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            updateSlider(e.clientX);
        }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (isDragging) {
            updateSlider(e.touches[0].clientX);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const updateSlider = (clientX: number) => {
        if (sliderRef.current) {
            const rect = sliderRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, x / rect.width));
            const minutesFromStart = Math.round(percentage * totalMinutes);
            const newTime = addMinutes(startDate, minutesFromStart);
            updateTime(newTime);
        }
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleTouchMove);
        document.addEventListener('touchend', handleTouchEnd);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    const generateTimeMarkers = () => {
        const markers = [];
        let currentMarker = startOfDay(startDate);
        const endMarker = endDate;

        while (currentMarker <= endMarker) {
            const position = (differenceInMinutes(currentMarker, startDate) / totalMinutes) * 100;
            const isMidnight = currentMarker.getHours() === 0 && currentMarker.getMinutes() === 0;

            if (position >= 0 && position <= 100) {
                markers.push(
                    <div key={currentMarker.getTime()} className="absolute bottom-0" style={{ left: `${position}%` }}>
                        <div className={`${isMidnight ? 'h-10 w-0.5 bg-foreground' : 'h-4 w-px bg-muted-foreground'}`}></div>
                    </div>
                );
            }
            currentMarker = addHours(currentMarker, 1);
        }

        return markers;
    };

    const generateDayLabels = () => {
        const labels = [];
        let currentDay = startDate;
        const endDay = endOfDay(endDate);

        while (currentDay <= endDay) {
            const startPosition = (differenceInMinutes(currentDay, startDate) / totalMinutes) * 100;
            const nextDay = addDays(startOfDay(currentDay), 1);
            const endPosition = (differenceInMinutes(nextDay > endDate ? endDate : nextDay, startDate) / totalMinutes) * 100;
            const width = endPosition - startPosition;

            labels.push(
                <div key={currentDay.getTime()} className="absolute" style={{ left: `${startPosition}%`, width: `${width}%`, minWidth: '100px' }}>
                    <div className="text-center text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        <span className="sm:hidden">{format(currentDay, 'dd/MM')}</span>
                        <span className="hidden sm:inline">{format(currentDay, 'EEEE, MMMM d')}</span>
                    </div>
                </div>
            );

            currentDay = nextDay;
        }

        return labels;
    };

    const generateHourLabels = () => {
        const labels = [];
        let currentHour = startOfDay(startDate);
        const endHour = endDate;

        while (currentHour <= endHour) {
            const position = (differenceInMinutes(currentHour, startDate) / totalMinutes) * 100;
            const hour = currentHour.getHours();

            if (position >= 0 && position <= 100) {
                labels.push(
                    <div key={currentHour.getTime()} className="absolute text-xs text-muted-foreground" style={{ left: `${position}%`, transform: 'translateX(-50%)' }}>
                        <span className="hidden sm:inline md:hidden">{hour % 6 === 0 ? hour : ''}</span>
                        <span className="hidden md:inline lg:hidden">{hour % 3 === 0 ? hour : ''}</span>
                        <span className="hidden lg:inline">{hour % 2 === 0 ? hour : ''}</span>
                    </div>
                );
            }
            currentHour = addHours(currentHour, 1);
        }

        return labels;
    };

    return (
        <div className="">
            <div className="relative h-10">
                <input
                    type="range"
                    ref={sliderRef as React.RefObject<HTMLInputElement>}
                    className="w-full h-10 rounded-full cursor-pointer appearance-none bg-transparent timeline"
                    min={0}
                    max={totalMinutes}
                    value={differenceInMinutes(currentTime, startDate)}
                    onChange={(e) => {
                        const newTime = addMinutes(startDate, parseInt(e.target.value));
                        updateTime(newTime);
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={{
                        WebkitAppearance: 'none',
                        outline: 'none',
                        background: 'transparent',
                    }}
                />
                <div className="absolute top-0 left-0 right-0 h-6 overflow-hidden pointer-events-none">
                    {generateDayLabels()}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none">
                    {generateTimeMarkers()}
                </div>
                <div
                    className="absolute top-0 h-10 w-1 bg-primary pointer-events-none"
                    style={{ left: `${(differenceInMinutes(currentTime, startDate) / totalMinutes) * 100}%` }}
                ></div>
            </div>
            <div className="relative h-6 mt-2">
                {generateHourLabels()}
            </div>
        </div>
    );
}